import { randomUUID } from 'node:crypto';
import { AppError, phoneSchema } from '../booking/config';
import type { Database, Queryable } from '../booking/db';
import type { SendSMS } from './provider';

const sidPattern=/^CA[a-f0-9]{32}$/i;
export async function phoneBusiness(db:Queryable,number:string){
  phoneSchema.parse(number);const b=(await db.query('SELECT * FROM businesses WHERE phone_number=$1',[number])).rows[0];
  if(!b)throw new AppError(404,'Phone route not found.');return b;
}
export async function inboundCall(db:Database,p:Record<string,string>){
  if(!sidPattern.test(p.CallSid||''))throw new AppError(400,'Invalid call identifier.');
  phoneSchema.parse(p.From);
  const b=await phoneBusiness(db,p.To);
  if(!b.routing_verified || !b.forward_number)throw new AppError(503,'Phone routing is inactive.');
  await db.query('INSERT INTO voice_calls(call_sid,business_id,caller) VALUES($1,$2,$3) ON CONFLICT(call_sid) DO NOTHING',[p.CallSid,b.id,p.From]);
  const existing=(await db.query('SELECT business_id,caller FROM voice_calls WHERE call_sid=$1',[p.CallSid])).rows[0];
  if(existing.business_id!==b.id || existing.caller!==p.From)throw new AppError(403,'Call route mismatch.');
  return b;
}
export async function consentCall(db:Database,p:Record<string,string>){
  const b=await phoneBusiness(db,p.To);
  await db.transaction(async tx=>{
    await tx.query('SELECT id FROM businesses WHERE id=$1 FOR UPDATE',[b.id]);
    const call=(await tx.query("SELECT * FROM voice_calls WHERE call_sid=$1 AND business_id=$2 AND caller=$3 AND created_at>now()-interval '1 hour'",[p.CallSid,b.id,p.From])).rows[0];
    if(!call)throw new AppError(404,'Call not found.');
    if(p.Digits==='1' && b.sms_enabled){
      await tx.query('UPDATE voice_calls SET consent=true WHERE call_sid=$1',[p.CallSid]);
      await tx.query(`INSERT INTO sms_contacts(business_id,phone,consent_at,consent_source) VALUES($1,$2,now(),'voice-keypress-v1') ON CONFLICT(business_id,phone) DO UPDATE SET consent_at=now(),consent_source='voice-keypress-v1',updated_at=now() WHERE sms_contacts.opted_out=false`,[b.id,p.From]);
    }
  });return b;
}
export async function missedCall(db:Database,p:Record<string,string>,enabled:boolean){
  if(!sidPattern.test(p.CallSid||''))throw new AppError(400,'Invalid call identifier.');
  return db.transaction(async tx=>{
    const b=await phoneBusiness(tx,p.To);await tx.query('SELECT id FROM businesses WHERE id=$1 FOR UPDATE',[b.id]);
    const call=(await tx.query("SELECT * FROM voice_calls WHERE call_sid=$1 AND business_id=$2 AND caller=$3 AND created_at>now()-interval '1 hour'",[p.CallSid,b.id,p.From])).rows[0];
    if(!call)throw new AppError(404,'Call not found.');
    const event=(await tx.query('INSERT INTO webhook_events(key) VALUES($1) ON CONFLICT DO NOTHING RETURNING key',[`dial:${p.CallSid}`])).rows[0];
    if(!event)return (await tx.query('SELECT id FROM sms_outbox WHERE call_sid=$1 AND state=\'pending\'',[p.CallSid])).rows[0]?.id as string|undefined;
    await tx.query('UPDATE voice_calls SET status=$2 WHERE call_sid=$1',[p.CallSid,p.DialCallStatus||'unknown']);
    if(!['no-answer','busy','failed'].includes(p.DialCallStatus))return;
    const contact=(await tx.query('SELECT * FROM sms_contacts WHERE business_id=$1 AND phone=$2',[b.id,p.From])).rows[0];
    const recent=(await tx.query("SELECT count(*)::int AS count FROM sms_outbox WHERE business_id=$1 AND created_at>now()-interval '24 hours' AND state<>'suppressed'",[b.id])).rows[0].count;
    const callerRecent=(await tx.query("SELECT id FROM sms_outbox WHERE business_id=$1 AND phone=$2 AND created_at>now()-interval '24 hours' AND state<>'suppressed' LIMIT 1",[b.id,p.From])).rows.length;
    const allowed=enabled && b.sms_enabled && b.routing_verified && b.booking_enabled && call.consent && contact?.consent_at && !contact.opted_out && recent<100 && !callerRecent;
    const id=randomUUID();await tx.query('INSERT INTO sms_outbox(id,business_id,call_sid,phone,state,error_code) VALUES($1,$2,$3,$4,$5,$6)',[id,b.id,p.CallSid,p.From,allowed?'pending':'suppressed',allowed?null:'inactive-consent-or-limit']);
    return allowed ? id:undefined;
  });
}
export async function incomingSMS(db:Database,p:Record<string,string>){
  const b=await phoneBusiness(db,p.To);phoneSchema.parse(p.From);
  const word=(p.OptOutType || p.Body || '').trim().toUpperCase();
  if(!['STOP','STOPALL','UNSUBSCRIBE','CANCEL','END','QUIT','REVOKE','OPTOUT','START','UNSTOP'].includes(word))return;
  await db.transaction(async tx=>{
    await tx.query('SELECT id FROM businesses WHERE id=$1 FOR UPDATE',[b.id]);
    const event=(await tx.query('INSERT INTO webhook_events(key) VALUES($1) ON CONFLICT DO NOTHING RETURNING key',[`sms-in:${p.MessageSid}`])).rows[0];if(!event)return;
    const optOut=!['START','UNSTOP'].includes(word);
    await tx.query(`INSERT INTO sms_contacts(business_id,phone,opted_out,consent_at,consent_source) VALUES($1,$2,$3,CASE WHEN $3 THEN NULL ELSE now() END,'sms-keyword') ON CONFLICT(business_id,phone) DO UPDATE SET opted_out=$3,consent_at=CASE WHEN $3 THEN NULL ELSE now() END,consent_source='sms-keyword',updated_at=now()`,[b.id,p.From,optOut]);
    if(optOut)await tx.query("UPDATE sms_outbox SET state='suppressed',error_code='opted-out',updated_at=now() WHERE business_id=$1 AND phone=$2 AND state='pending'",[b.id,p.From]);
  });
}
export async function dispatchSMS(db:Database,id:string,send:SendSMS,publicOrigin:string,enabled:boolean){
  // Claim durably before the network call. A crash/timeout is never auto-retried.
  const owner=(await db.query('SELECT business_id FROM sms_outbox WHERE id=$1',[id])).rows[0];if(!owner)return;
  const claimed=await db.transaction(async tx=>{
    await tx.query('SELECT id FROM businesses WHERE id=$1 FOR UPDATE',[owner.business_id]);
    return (await tx.query("UPDATE sms_outbox SET state='sending',updated_at=now() WHERE id=$1 AND state='pending' RETURNING id",[id])).rows.length>0;
  });if(!claimed)return;
  try{
    await db.transaction(async tx=>{
      const b=(await tx.query('SELECT * FROM businesses WHERE id=$1 FOR UPDATE',[owner.business_id])).rows[0];
      const message=(await tx.query('SELECT * FROM sms_outbox WHERE id=$1 FOR UPDATE',[id])).rows[0];
      const contact=(await tx.query('SELECT * FROM sms_contacts WHERE business_id=$1 AND phone=$2',[b.id,message.phone])).rows[0];
      if(!enabled || !b.sms_enabled || !b.booking_enabled || !b.routing_verified || contact?.opted_out || !contact?.consent_at){await tx.query("UPDATE sms_outbox SET state='suppressed',error_code='inactive-or-opted-out',updated_at=now() WHERE id=$1",[id]);return;}
      const body=`${b.name}: Sorry we missed your call. Book a repair: ${publicOrigin}/book/${b.slug}. Reply STOP to opt out.`;
      const result=await send({from:b.phone_number,to:message.phone,body,statusCallback:`${publicOrigin}/api/telephony/sms-status?id=${id}`});
      await tx.query("UPDATE sms_outbox SET state='accepted',provider_sid=$2,updated_at=now() WHERE id=$1",[id,result.sid]);
    });
  }catch(e){
    // Twilio API rejections expose a numeric code; network ambiguity remains unknown.
    const code=typeof e==='object' && e && 'code' in e && /^\d{5}$/.test(String(e.code))?String(e.code):null;
    await db.query("UPDATE sms_outbox SET state=$2,error_code=$3,updated_at=now() WHERE id=$1 AND state='sending'",[id,code?'failed':'unknown',code||'delivery-uncertain']);
    console.error('RepairSlot SMS delivery failed',{outboxId:id,code:code||'delivery-uncertain'});
  }
}
export async function smsStatus(db:Database,id:string,p:Record<string,string>){
  const row=(await db.query('SELECT business_id,phone,provider_sid FROM sms_outbox WHERE id=$1',[id])).rows[0];
  if(!row)throw new AppError(404,'Message not found.');
  const b=(await db.query('SELECT phone_number FROM businesses WHERE id=$1',[row.business_id])).rows[0];
  if(row.phone!==p.To || b.phone_number!==p.From || (row.provider_sid && row.provider_sid!==p.MessageSid))throw new AppError(403,'Message route mismatch.');
  if(!['queued','sent','delivered','failed','undelivered'].includes(p.MessageStatus))return;
  await db.transaction(async tx=>{
    await tx.query('SELECT id FROM businesses WHERE id=$1 FOR UPDATE',[row.business_id]);
    const current=(await tx.query('SELECT provider_sid FROM sms_outbox WHERE id=$1 FOR UPDATE',[id])).rows[0];
    if(current.provider_sid && current.provider_sid!==p.MessageSid)throw new AppError(403,'Message route mismatch.');
    const event=(await tx.query('INSERT INTO webhook_events(key) VALUES($1) ON CONFLICT DO NOTHING RETURNING key',[`sms-status:${p.MessageSid}:${p.MessageStatus}`])).rows[0];if(!event)return;
    const state=p.MessageStatus==='delivered'?'delivered':['failed','undelivered'].includes(p.MessageStatus)?'failed':'accepted';
    await tx.query("UPDATE sms_outbox SET state=$2,provider_sid=$3,error_code=$4,updated_at=now() WHERE id=$1 AND state IN ('sending','unknown','accepted')",[id,state,p.MessageSid,/^\d{5}$/.test(p.ErrorCode||'')?p.ErrorCode:null]);
    if(p.ErrorCode==='21610')await tx.query("UPDATE sms_contacts SET opted_out=true,consent_at=NULL,updated_at=now() WHERE business_id=$1 AND phone=$2",[row.business_id,row.phone]);
  });
}
