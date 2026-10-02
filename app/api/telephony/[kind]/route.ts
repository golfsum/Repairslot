import { z } from 'zod';
import { database } from '../../../../lib/booking/db';
import { origin, smsReady, AppError } from '../../../../lib/booking/config';
import { failure } from '../../../../lib/booking/http';
import { verifiedParams, xmlEscape, xml, sendSMS } from '../../../../lib/telephony/provider';
import { inboundCall, consentCall, missedCall, incomingSMS, dispatchSMS, smsStatus } from '../../../../lib/telephony/service';
export const runtime='nodejs';
function dial(b:any){
  if(!b.routing_verified || !b.forward_number)throw new AppError(503,'Phone routing is inactive.');
  return xml(`<Dial timeout="20" action="${xmlEscape(origin()+'/api/telephony/dial')}" method="POST"><Number>${xmlEscape(b.forward_number)}</Number></Dial>`);
}
export async function POST(request:Request,context:{params:Promise<{kind:string}>}){
  try{
    const {kind}=await context.params;const p=await verifiedParams(request);const db=database();
    if(['inbound','consent','dial'].includes(kind) && (process.env.PHONE_ROUTING_ENABLED!=='true' || process.env.NODE_ENV==='test' || (process.env.VERCEL_ENV && process.env.VERCEL_ENV!=='production')))throw new AppError(503,'Live phone routing is inactive.');
    const enabled=smsReady() && (!process.env.VERCEL_ENV || process.env.VERCEL_ENV==='production') && process.env.NODE_ENV!=='test';
    if(kind==='inbound'){
      const b=await inboundCall(db,p);
      if(!enabled || !b.sms_enabled)return dial(b);
      // A missed call by itself is NOT treated as permission to text.
      return xml(`<Gather numDigits="1" timeout="4" actionOnEmptyResult="true" action="${xmlEscape(origin()+'/api/telephony/consent')}" method="POST"><Say>${xmlEscape(`You have reached ${b.name}. To receive one text with a booking link if we cannot answer, press 1. Message and data rates may apply. You can reply STOP to opt out. ${b.consent_notice}`)}</Say></Gather>`);
    }
    if(kind==='consent')return dial(await consentCall(db,p));
    if(kind==='dial'){
      const id=await missedCall(db,p,enabled);if(id)await dispatchSMS(db,id,sendSMS,origin(),enabled);
      return xml('<Hangup/>');
    }
    if(kind==='sms-inbound'){if(!/^SM[a-f0-9]{32}$/i.test(p.MessageSid||''))throw new AppError(400,'Invalid message identifier.');await incomingSMS(db,p);return xml();}
    if(kind==='sms-status'){const id=z.string().uuid().parse(new URL(request.url).searchParams.get('id'));if(!/^SM[a-f0-9]{32}$/i.test(p.MessageSid||''))throw new AppError(400,'Invalid message identifier.');await smsStatus(db,id,p);return xml();}
    throw new AppError(404,'Callback not found.');
  }catch(e){return failure(e);}
}
