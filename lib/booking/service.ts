import { createHash, createHmac, randomUUID } from 'node:crypto';
import { Temporal } from '@js-temporal/polyfill';
import { z } from 'zod';
import { AppError, phoneSchema, slugSchema } from './config';
import type { Database, Queryable } from './db';

export const bookingInput=z.object({serviceId:z.string().uuid(),startsAt:z.string().datetime({offset:true}),customerName:z.string().trim().min(2).max(100),phone:phoneSchema,address:z.string().trim().min(8).max(300),postalCode:z.string().trim().regex(/^\d{5}$/),idempotencyKey:z.string().uuid(),smsConsent:z.boolean().default(false),website:z.string().max(0).optional()}).strict();
export const businessInput=z.object({slug:slugSchema,name:z.string().trim().min(2).max(100),timezone:z.string().max(100).refine(v=>{try{Temporal.Now.zonedDateTimeISO(v);return true;}catch{return false;}}),postalCodes:z.array(z.string().regex(/^\d{5}$/)).min(1).max(200),bookingEnabled:z.boolean(),phoneNumber:phoneSchema.optional(),forwardNumber:phoneSchema.optional(),smsEnabled:z.boolean(),routingVerified:z.boolean(),consentNotice:z.string().trim().max(500)}).strict().refine(v=>!v.smsEnabled || Boolean(v.phoneNumber && v.forwardNumber && v.routingVerified && v.consentNotice.length>=20),'Complete phone routing and consent setup first.').refine(v=>!v.phoneNumber || v.phoneNumber!==v.forwardNumber,'Forwarding cannot loop back to the inbound number.');
export const serviceInput=z.object({name:z.string().trim().min(2).max(100),durationMinutes:z.number().int().min(15).max(480)}).strict();
export const windowInput=z.object({resourceId:z.string().uuid(),startsAt:z.string().datetime({offset:true}),endsAt:z.string().datetime({offset:true})}).strict().refine(v=>Date.parse(v.endsAt)>Date.parse(v.startsAt)&&Date.parse(v.endsAt)-Date.parse(v.startsAt)<=86400000,'Use a window of at most 24 hours.');
export const digest=(value:string)=>createHash('sha256').update(value).digest('hex');
export function manageToken(businessId:string,key:string,secret:string){return createHmac('sha256',secret).update(`${businessId}:${key}`).digest('base64url');}

export async function business(db:Queryable,slug:string,lock=false) {
  slugSchema.parse(slug);
  const row=(await db.query(`SELECT * FROM businesses WHERE slug=$1${lock?' FOR UPDATE':''}`,[slug])).rows[0];
  if(!row) throw new AppError(404,'Business not found.');
  return row;
}
export async function rateLimit(db:Queryable,key:string,limit:number,seconds=3600) {
  const result=await db.query(`INSERT INTO rate_limits(key,window_start,count) VALUES($1,now(),1)
    ON CONFLICT(key) DO UPDATE SET count=CASE WHEN rate_limits.window_start<now()-($2*interval '1 second') THEN 1 ELSE rate_limits.count+1 END,
    window_start=CASE WHEN rate_limits.window_start<now()-($2*interval '1 second') THEN now() ELSE rate_limits.window_start END RETURNING count`,[key,seconds]);
  if(result.rows[0].count>limit) throw new AppError(429,'Too many requests. Please try again later.');
}
export function ipKey(request:Request,secret:string) {
  // Vercel controls this header. Local/non-Vercel hosts share one bucket; never trust arbitrary X-Forwarded-For.
  const ip=process.env.VERCEL ? request.headers.get('x-vercel-forwarded-for')?.split(',')[0] || 'unknown' : 'local';
  return createHmac('sha256',secret).update(ip).digest('hex');
}
function iso(v:Date|string){return new Date(v).toISOString();}
export async function availableSlots(db:Queryable,b:any,serviceId:string,date:string,now=new Date()) {
  z.string().uuid().parse(serviceId);z.string().regex(/^\d{4}-\d{2}-\d{2}$/).parse(date);
  let day:Temporal.PlainDate;
  try{day=Temporal.PlainDate.from(date);}catch{throw new AppError(400,'Invalid date.');}
  const today=Temporal.Instant.from(now.toISOString()).toZonedDateTimeISO(b.timezone).toPlainDate();
  const days=today.until(day).days;
  if(days<0||days>60) throw new AppError(400,'Choose a date within the next 60 days.');
  const service=(await db.query('SELECT * FROM services WHERE business_id=$1 AND id=$2 AND active=true',[b.id,serviceId])).rows[0];
  if(!service) throw new AppError(404,'Service not found.');
  const start=day.toZonedDateTime(b.timezone).toInstant().toString();
  const end=day.add({days:1}).toZonedDateTime(b.timezone).toInstant().toString();
  const windows=(await db.query('SELECT * FROM availability WHERE business_id=$1 AND starts_at<$3 AND ends_at>$2 ORDER BY starts_at LIMIT 200',[b.id,start,end])).rows;
  const booked=(await db.query("SELECT resource_id,starts_at,ends_at FROM bookings WHERE business_id=$1 AND status='confirmed' AND starts_at<$3 AND ends_at>$2",[b.id,start,end])).rows;
  const result=new Map<string,{startsAt:string;endsAt:string;resourceId:string}>();
  for(const w of windows){
    const first=new Date(w.starts_at).getTime();const duration=service.duration_minutes*60000;
    for(let t=first;t+duration<=new Date(w.ends_at).getTime();t+=30*60000){
      if(t<new Date(start).getTime()||t>=new Date(end).getTime()||t<now.getTime()+3600000)continue;
      if(booked.some(x=>x.resource_id===w.resource_id && new Date(x.starts_at).getTime()<t+duration && new Date(x.ends_at).getTime()>t))continue;
      const key=new Date(t).toISOString();if(!result.has(key))result.set(key,{startsAt:key,endsAt:new Date(t+duration).toISOString(),resourceId:w.resource_id});
    }
  }
  return [...result.values()].sort((a,b)=>a.startsAt.localeCompare(b.startsAt));
}
export async function book(db:Database,slug:string,raw:unknown,secret:string,now=new Date()) {
  const input=bookingInput.parse(raw);
  return db.transaction(async tx=>{
    const b=await business(tx,slug,true);
    if(!b.booking_enabled)throw new AppError(503,'This business is not accepting online bookings yet.');
    const fingerprint=digest(JSON.stringify({...input,startsAt:iso(input.startsAt)}));
    const previous=(await tx.query('SELECT id,status,starts_at,ends_at,request_hash FROM bookings WHERE business_id=$1 AND idempotency_key=$2',[b.id,input.idempotencyKey])).rows[0];
    const token=manageToken(b.id,input.idempotencyKey,secret);
    if(previous){if(previous.request_hash!==fingerprint)throw new AppError(409,'This submission has changed. Start a new booking.');return{id:previous.id,status:previous.status,startsAt:iso(previous.starts_at),endsAt:iso(previous.ends_at),token,timezone:b.timezone};}
    if(!b.postal_codes.includes(input.postalCode))throw new AppError(400,'This address is outside the configured service area.');
    const date=Temporal.Instant.from(iso(input.startsAt)).toZonedDateTimeISO(b.timezone).toPlainDate().toString();
    const slot=(await availableSlots(tx,b,input.serviceId,date,now)).find(s=>s.startsAt===iso(input.startsAt));
    if(!slot)throw new AppError(409,'That service window was just taken or is unavailable. Please choose another.');
    const id=randomUUID();
    await tx.query('INSERT INTO bookings(business_id,id,service_id,resource_id,starts_at,ends_at,customer_name,phone,address,postal_code,idempotency_key,request_hash,token_hash) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)',[b.id,id,input.serviceId,slot.resourceId,slot.startsAt,slot.endsAt,input.customerName,input.phone,input.address,input.postalCode,input.idempotencyKey,fingerprint,digest(token)]);
    if(input.smsConsent) await tx.query(`INSERT INTO sms_contacts(business_id,phone,consent_at,consent_source) VALUES($1,$2,now(),'booking-checkbox-v1') ON CONFLICT(business_id,phone) DO UPDATE SET consent_at=now(),consent_source='booking-checkbox-v1',updated_at=now() WHERE sms_contacts.opted_out=false`,[b.id,input.phone]);
    return{id,status:'confirmed',startsAt:slot.startsAt,endsAt:slot.endsAt,token,timezone:b.timezone};
  });
}
export async function manageBooking(db:Database,slug:string,token:string,cancel=false) {
  z.string().regex(/^[A-Za-z0-9_-]{43}$/).parse(token);
  return db.transaction(async tx=>{
    const b=await business(tx,slug,true);
    const row=(await tx.query('SELECT b.id,b.status,b.starts_at,b.ends_at,s.name AS service FROM bookings b JOIN services s ON s.business_id=b.business_id AND s.id=b.service_id WHERE b.business_id=$1 AND token_hash=$2',[b.id,digest(token)])).rows[0];
    if(!row)throw new AppError(404,'Booking not found.');
    if(cancel && row.status==='confirmed'){
      if(new Date(row.starts_at).getTime()<=Date.now())throw new AppError(409,'Please contact the business to cancel a past appointment.');
      await tx.query("UPDATE bookings SET status='cancelled',cancelled_at=now() WHERE business_id=$1 AND id=$2",[b.id,row.id]);row.status='cancelled';
    }
    return{id:row.id,status:row.status,startsAt:iso(row.starts_at),endsAt:iso(row.ends_at),service:row.service,timezone:b.timezone,businessName:b.name};
  });
}
