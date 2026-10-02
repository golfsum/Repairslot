import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { Pool } from 'pg';
import twilio from 'twilio';
import { Temporal } from '@js-temporal/polyfill';
import { book, manageBooking, availableSlots, business, rateLimit, businessInput } from '../lib/booking/service';
import { requireOperator, requireSameOrigin } from '../lib/booking/auth';
import { bookingReady, smsReady } from '../lib/booking/config';
import type { Database } from '../lib/booking/db';
import { verifiedParams, sendSMS } from '../lib/telephony/provider';
import { inboundCall, consentCall, missedCall, incomingSMS, dispatchSMS, smsStatus } from '../lib/telephony/service';

Object.assign(process.env,{NODE_ENV:'test'});
process.env.APP_ORIGIN='https://repairslot.test';
const secret='synthetic-test-secret-at-least-32-characters';
const account='AC'+'1'.repeat(32);const caller='+15550001111';const number='+15550002222';
async function fixture(){
  let db:Database;let close:()=>Promise<void>;
  const migration=await readFile(new URL('../db/001-booking.sql',import.meta.url),'utf8');
  if(process.env.TEST_DATABASE_URL){
    const url=new URL(process.env.TEST_DATABASE_URL);if(!['127.0.0.1','localhost'].includes(url.hostname))throw Error('Real database tests require an isolated loopback PostgreSQL server.');
    const schema='test_'+randomUUID().replaceAll('-','');
    const pool=new Pool({connectionString:process.env.TEST_DATABASE_URL,max:4,options:`-c search_path=${schema}`});
    await pool.query(`CREATE SCHEMA ${schema}`);await pool.query(migration);
    db={query:(text,values)=>pool.query(text,values),transaction:async fn=>{const c=await pool.connect();try{await c.query('BEGIN');const r=await fn(c);await c.query('COMMIT');return r;}catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}}};
    close=async()=>{await pool.query(`DROP SCHEMA ${schema} CASCADE`);await pool.end();};
  }else{
    const engine=new PGlite();await engine.exec(migration);
    db={query:async(text,values)=>{const r=await engine.query(text,values);return{rows:r.rows as any[],rowCount:r.affectedRows};},transaction:fn=>engine.transaction(tx=>fn({query:async(text,values)=>{const r=await tx.query(text,values);return{rows:r.rows as any[],rowCount:r.affectedRows};}}))};
    close=()=>engine.close();
  }
  const a=randomUUID(),b=randomUUID(),service=randomUUID(),otherService=randomUUID(),resource=randomUUID();
  const start=new Date(Date.now()+2*86400000);start.setUTCHours(16,0,0,0);const end=new Date(start.getTime()+4*3600000);
  await db.query("INSERT INTO businesses(id,slug,name,timezone,postal_codes,booking_enabled,phone_number,forward_number,sms_enabled,routing_verified,consent_notice) VALUES($1,'alpha-shop','Alpha Repair','America/Phoenix',ARRAY['85710'],true,$3,'+15550003333',true,true,'Contact Alpha Repair for help.'),($2,'beta-shop','Beta Repair','America/New_York',ARRAY['10001'],true,'+15550004444','+15550005555',true,true,'Contact Beta Repair for help.')",[a,b,number]);
  await db.query("INSERT INTO services(business_id,id,name,duration_minutes) VALUES($1,$3,'Washer repair',60),($2,$4,'Other repair',60)",[a,b,service,otherService]);
  await db.query("INSERT INTO resources(business_id,id,name) VALUES($1,$2,'Test technician')",[a,resource]);
  await db.query('INSERT INTO availability(business_id,id,resource_id,starts_at,ends_at) VALUES($1,$2,$3,$4,$5)',[a,randomUUID(),resource,start.toISOString(),end.toISOString()]);
  const input={serviceId:service,startsAt:start.toISOString(),customerName:'Test Customer',phone:caller,address:'123 Synthetic Street',postalCode:'85710',idempotencyKey:randomUUID(),smsConsent:false,website:''};
  const call={CallSid:'CA'+'a'.repeat(32),From:caller,To:number,AccountSid:account};
  return{db,a,b,service,otherService,resource,start,end,input,call,close};
}

test('booking lifecycle persists, repeats safely, keeps tokens private, and cancels idempotently',async()=>{
  const f=await fixture();try{
    const [first,again]=await Promise.all([book(f.db,'alpha-shop',f.input,secret),book(f.db,'alpha-shop',f.input,secret)]);assert.deepEqual(again,first);
    assert.equal((await f.db.query('SELECT count(*)::int AS n FROM bookings')).rows[0].n,1);
    const stored=(await f.db.query('SELECT token_hash FROM bookings')).rows[0];assert.notEqual(stored.token_hash,first.token);
    const managed=await manageBooking(f.db,'alpha-shop',first.token);assert.equal(managed.service,'Washer repair');assert.equal('phone' in managed,false);assert.equal('address' in managed,false);
    await assert.rejects(()=>book(f.db,'alpha-shop',{...f.input,address:'456 Different Street'},secret),/submission has changed/);
    assert.equal((await manageBooking(f.db,'alpha-shop',first.token,true)).status,'cancelled');assert.equal((await manageBooking(f.db,'alpha-shop',first.token,true)).status,'cancelled');
    assert.equal((await book(f.db,'alpha-shop',{...f.input,idempotencyKey:randomUUID()},secret)).status,'confirmed');
  }finally{await f.close();}
});
test('concurrent last-capacity requests reserve once; database guard also rejects overlaps',async()=>{
  const f=await fixture();try{
    const results=await Promise.allSettled([book(f.db,'alpha-shop',f.input,secret),book(f.db,'alpha-shop',{...f.input,idempotencyKey:randomUUID()},secret)]);
    assert.equal(results.filter(x=>x.status==='fulfilled').length,1);assert.equal(results.filter(x=>x.status==='rejected').length,1);
    const insert='INSERT INTO bookings(business_id,id,service_id,resource_id,starts_at,ends_at,customer_name,phone,address,postal_code,idempotency_key,request_hash,token_hash) VALUES($1,$2,$3,$4,$5,$6,\'X\',\'+15550001111\',\'123 Test Street\',\'85710\',$7,\'test\',$8)';
    await assert.rejects(()=>f.db.query(insert,[f.a,randomUUID(),f.service,f.resource,f.start.toISOString(),new Date(f.start.getTime()+3600000).toISOString(),randomUUID(),randomUUID()]),/no longer available/);
    const next=await book(f.db,'alpha-shop',{...f.input,startsAt:new Date(f.start.getTime()+3600000).toISOString(),idempotencyKey:randomUUID()},secret);assert.equal(next.status,'confirmed');
  }finally{await f.close();}
});
test('tenant authorization and composite foreign keys prevent cross-business use',async()=>{
  const f=await fixture();try{
    await assert.rejects(()=>book(f.db,'alpha-shop',{...f.input,serviceId:f.otherService},secret),/Service not found/);
    const booked=await book(f.db,'alpha-shop',f.input,secret);await assert.rejects(()=>manageBooking(f.db,'beta-shop',booked.token),/Booking not found/);
    await assert.rejects(()=>manageBooking(f.db,'alpha-shop','x'.repeat(43)),/Booking not found/);
    await assert.rejects(()=>f.db.query('INSERT INTO availability(business_id,id,resource_id,starts_at,ends_at) VALUES($1,$2,$3,$4,$5)',[f.b,randomUUID(),f.resource,f.start.toISOString(),f.end.toISOString()]),/foreign key/);
  }finally{await f.close();}
});
test('validates service area, lead time, interval alignment, dates, and paused booking',async()=>{
  const f=await fixture();try{
    await assert.rejects(()=>book(f.db,'alpha-shop',{...f.input,postalCode:'10001'},secret),/outside/);
    await assert.rejects(()=>book(f.db,'alpha-shop',{...f.input,startsAt:new Date(f.start.getTime()+60000).toISOString()},secret),/unavailable/);
    const b=await business(f.db,'alpha-shop');await assert.rejects(()=>availableSlots(f.db,b,f.service,'2026-02-30'),/Invalid date/);
    assert.equal((await availableSlots(f.db,b,f.service,f.start.toISOString().slice(0,10),new Date(f.start.getTime()-1800000))).some(s=>s.startsAt===f.start.toISOString()),false);
    await f.db.query('UPDATE businesses SET booking_enabled=false WHERE id=$1',[f.a]);await assert.rejects(()=>book(f.db,'alpha-shop',f.input,secret),/not accepting/);
    await assert.rejects(()=>book(f.db,'demo',f.input,secret));
  }finally{await f.close();}
});
test('timezone boundaries and DST use UTC instants without inventing skipped or duplicate local times',async()=>{
  const f=await fixture();try{
    await f.db.query("UPDATE businesses SET timezone='America/New_York' WHERE id=$1",[f.a]);
    await f.db.query('DELETE FROM availability');await f.db.query('INSERT INTO availability(business_id,id,resource_id,starts_at,ends_at) VALUES($1,$2,$3,$4,$5)',[f.a,randomUUID(),f.resource,'2026-11-01T04:00:00Z','2026-11-01T09:00:00Z']);
    const b=await business(f.db,'alpha-shop');const slots=await availableSlots(f.db,b,f.service,'2026-11-01',new Date('2026-10-30T12:00:00Z'));
    assert.ok(slots.some(s=>s.startsAt==='2026-11-01T05:00:00.000Z'));assert.ok(slots.some(s=>s.startsAt==='2026-11-01T06:00:00.000Z'));
    assert.throws(()=>Temporal.PlainDateTime.from('2026-11-01T01:30').toZonedDateTime('America/New_York',{disambiguation:'reject'}));
    assert.throws(()=>Temporal.PlainDateTime.from('2026-03-08T02:30').toZonedDateTime('America/New_York',{disambiguation:'reject'}));
    assert.equal(new Set(slots.map(s=>s.startsAt)).size,slots.length);
  }finally{await f.close();}
});
test('operator auth and same-origin mutation checks fail closed; configuration is inactive by default',()=>{
  delete process.env.ADMIN_PASSWORD;assert.throws(()=>requireOperator(new Request('https://repairslot.test/api/operator/booking')),/not configured/);
  process.env.ADMIN_PASSWORD='synthetic-operator-password';assert.throws(()=>requireOperator(new Request('https://repairslot.test/api/operator/booking')),/authentication/);
  assert.throws(()=>requireOperator(new Request('https://repairslot.test/api/operator/booking',{headers:{authorization:'Basic '+Buffer.from('admin:wrong').toString('base64')}})),/authentication/);
  requireOperator(new Request('https://repairslot.test/api/operator/booking',{headers:{authorization:'Basic '+Buffer.from('admin:synthetic-operator-password').toString('base64')}}));
  assert.throws(()=>requireSameOrigin(new Request('https://repairslot.test/api',{headers:{origin:'https://attacker.test'}})),/not allowed/);
  assert.throws(()=>requireSameOrigin(new Request('https://repairslot.test/api')),/not allowed/);
  requireSameOrigin(new Request('https://repairslot.test/api',{headers:{origin:'https://repairslot.test'}}));
  delete process.env.BOOKING_ENABLED;delete process.env.SMS_ENABLED;assert.equal(bookingReady(),false);assert.equal(smsReady(),false);
  assert.equal(businessInput.safeParse({slug:'demo',name:'Test',timezone:'invalid',postalCodes:['bad'],bookingEnabled:true,smsEnabled:true,routingVerified:false,consentNotice:''}).success,false);
});
test('provider signatures bind all fields, account, and canonical URL; invalid and duplicate fields fail',async()=>{
  process.env.DATABASE_URL='unused-test-placeholder';process.env.TWILIO_AUTH_TOKEN='synthetic-token';process.env.TWILIO_ACCOUNT_SID=account;
  const url='https://repairslot.test/api/telephony/inbound';const params={AccountSid:account,CallSid:'CA'+'b'.repeat(32),From:caller,To:number};
  const signature=twilio.getExpectedTwilioSignature('synthetic-token',url,params);
  const req=(body:string,sig=signature)=>new Request(url,{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded','x-twilio-signature':sig},body});
  assert.deepEqual(await verifiedParams(req(new URLSearchParams(params).toString())),params);
  await assert.rejects(()=>verifiedParams(req(new URLSearchParams({...params,From:'+15559999999'}).toString())),/signature/);
  await assert.rejects(()=>verifiedParams(req(new URLSearchParams(params).toString(),'wrong')),/signature/);
  await assert.rejects(()=>verifiedParams(req(new URLSearchParams(params).toString()+'&To=other')),/Duplicate/);
  await assert.rejects(()=>sendSMS({from:number,to:caller,body:'Must not send',statusCallback:url}),/inactive/);
  delete process.env.DATABASE_URL;
});
test('missed-call replay and concurrent dispatch produce one fake SMS, never real side effects',async()=>{
  const f=await fixture();try{
    await inboundCall(f.db,f.call);await consentCall(f.db,{...f.call,Digits:'1'});
    const id=await missedCall(f.db,{...f.call,DialCallStatus:'no-answer'},true);assert.ok(id);
    assert.equal(await missedCall(f.db,{...f.call,DialCallStatus:'no-answer'},true),id);
    let sends=0;const send=async(data:any)=>{sends++;assert.equal(data.to,caller);assert.ok(data.body.includes('/book/alpha-shop'));assert.ok(data.body.includes('STOP'));return{sid:'SM'+'c'.repeat(32)};};
    await Promise.all([dispatchSMS(f.db,id,send,'https://repairslot.test',true),dispatchSMS(f.db,id,send,'https://repairslot.test',true)]);assert.equal(sends,1);
    await missedCall(f.db,{...f.call,DialCallStatus:'no-answer'},true);assert.equal((await f.db.query('SELECT count(*)::int AS n FROM sms_outbox')).rows[0].n,1);
    await smsStatus(f.db,id,{To:caller,From:number,MessageSid:'SM'+'c'.repeat(32),MessageStatus:'delivered'});await smsStatus(f.db,id,{To:caller,From:number,MessageSid:'SM'+'c'.repeat(32),MessageStatus:'queued'});
    assert.equal((await f.db.query('SELECT state FROM sms_outbox')).rows[0].state,'delivered');
  }finally{await f.close();}
});
test('no consent, answered calls, disabled setup, old calls, and cross-tenant callbacks do not send',async()=>{
  const f=await fixture();try{
    await inboundCall(f.db,f.call);assert.equal(await missedCall(f.db,{...f.call,DialCallStatus:'no-answer'},true),undefined);
    const call2={...f.call,CallSid:'CA'+'d'.repeat(32)};await inboundCall(f.db,call2);await consentCall(f.db,{...call2,Digits:'1'});assert.equal(await missedCall(f.db,{...call2,DialCallStatus:'completed'},true),undefined);
    const call3={...f.call,CallSid:'CA'+'e'.repeat(32)};await inboundCall(f.db,call3);await consentCall(f.db,{...call3,Digits:'1'});assert.equal(await missedCall(f.db,{...call3,DialCallStatus:'busy'},false),undefined);
    await assert.rejects(()=>missedCall(f.db,{...call3,To:'+15550004444',DialCallStatus:'busy'},true),/Call not found/);
    const call4={...f.call,CallSid:'CA'+'f'.repeat(32)};await inboundCall(f.db,call4);await f.db.query("UPDATE voice_calls SET created_at=now()-interval '2 hours' WHERE call_sid=$1",[call4.CallSid]);await assert.rejects(()=>missedCall(f.db,{...call4,DialCallStatus:'busy'},true),/Call not found/);
  }finally{await f.close();}
});
test('STOP suppresses pending delivery, voice consent cannot override STOP, and START restores permission',async()=>{
  const f=await fixture();try{
    await inboundCall(f.db,f.call);await consentCall(f.db,{...f.call,Digits:'1'});const id=await missedCall(f.db,{...f.call,DialCallStatus:'busy'},true);assert.ok(id);
    const stop={From:caller,To:number,MessageSid:'SM'+'1'.repeat(32),Body:'STOP'};await incomingSMS(f.db,stop);await incomingSMS(f.db,stop);
    let sends=0;await dispatchSMS(f.db,id,async()=>{sends++;return{sid:'SM'+'2'.repeat(32)};},'https://repairslot.test',true);assert.equal(sends,0);
    await consentCall(f.db,{...f.call,Digits:'1'});assert.equal((await f.db.query('SELECT opted_out FROM sms_contacts')).rows[0].opted_out,true);
    await incomingSMS(f.db,{...stop,MessageSid:'SM'+'3'.repeat(32),Body:'START'});assert.equal((await f.db.query('SELECT opted_out FROM sms_contacts')).rows[0].opted_out,false);
    await incomingSMS(f.db,stop);assert.equal((await f.db.query('SELECT opted_out FROM sms_contacts')).rows[0].opted_out,false,'old STOP callback is not applied again');
  }finally{await f.close();}
});
test('uncertain delivery is observable and never automatically resent; recipient cooldown is durable',async()=>{
  const f=await fixture();try{
    await inboundCall(f.db,f.call);await consentCall(f.db,{...f.call,Digits:'1'});const id=await missedCall(f.db,{...f.call,DialCallStatus:'failed'},true);assert.ok(id);
    let sends=0;const failing=async()=>{sends++;throw Error('Synthetic network timeout');};await dispatchSMS(f.db,id,failing,'https://repairslot.test',true);await dispatchSMS(f.db,id,failing,'https://repairslot.test',true);assert.equal(sends,1);assert.equal((await f.db.query('SELECT state FROM sms_outbox')).rows[0].state,'unknown');
    const call2={...f.call,CallSid:'CA'+'2'.repeat(32)};await inboundCall(f.db,call2);await consentCall(f.db,{...call2,Digits:'1'});assert.equal(await missedCall(f.db,{...call2,DialCallStatus:'no-answer'},true),undefined);
    await assert.rejects(()=>smsStatus(f.db,id,{To:'+15559999999',From:number,MessageSid:'SM'+'4'.repeat(32),MessageStatus:'delivered'}),/route mismatch/);
  }finally{await f.close();}
});
test('persistent rate counters enforce limits across callers and reset after their window',async()=>{
  const f=await fixture();try{await rateLimit(f.db,'synthetic',2);await rateLimit(f.db,'synthetic',2);await assert.rejects(()=>rateLimit(f.db,'synthetic',2),/Too many/);await f.db.query("UPDATE rate_limits SET window_start=now()-interval '2 hours'");await rateLimit(f.db,'synthetic',2);assert.equal((await f.db.query('SELECT count FROM rate_limits')).rows[0].count,1);}finally{await f.close();}
});
