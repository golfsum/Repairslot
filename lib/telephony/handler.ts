import { z } from 'zod';
import type { Database } from '../booking/db';
import { origin, phoneSchema, AppError } from '../booking/config';
import { failure } from '../booking/http';
import { verifiedParams, xmlEscape, xml } from './provider';
import type { SendSMS } from './provider';
import { inboundCall, consentCall, missedCall, incomingSMS, dispatchSMS, smsStatus } from './service';

function dial(b:any){
  if(!b.routing_verified || !b.forward_number)throw new AppError(503,'Phone routing is inactive.');
  return xml(`<Dial timeout="20" action="${xmlEscape(origin()+'/api/telephony/dial')}" method="POST"><Number>${xmlEscape(b.forward_number)}</Number></Dial>`);
}
export function createTelephonyHandler(deps:{database:()=>Database;voiceReady:()=>boolean;messagingReady:()=>boolean;send:SendSMS}){
return async function POST(request:Request,context:{params:Promise<{kind:string}>}){
  try{
    const {kind}=await context.params;const p=await verifiedParams(request);const db=deps.database();
    if(['inbound','consent','dial'].includes(kind) && !deps.voiceReady())throw new AppError(503,'Live phone routing is inactive.');
    const enabled=deps.messagingReady();
    if(kind==='inbound'){
      const b=await inboundCall(db,p);
      if(!enabled || !b.sms_enabled || !phoneSchema.safeParse(p.From).success)return dial(b);
      // A missed call by itself is NOT treated as permission to text.
      return xml(`<Gather numDigits="1" timeout="4" actionOnEmptyResult="true" action="${xmlEscape(origin()+'/api/telephony/consent')}" method="POST"><Say>${xmlEscape(`You have reached ${b.name}. To receive one text with a booking link if we cannot answer, press 1. Message and data rates may apply. You can reply STOP to opt out. ${b.consent_notice}`)}</Say></Gather>`);
    }
    if(kind==='consent')return dial(await consentCall(db,p));
    if(kind==='dial'){
      const id=await missedCall(db,p,enabled);if(id)await dispatchSMS(db,id,deps.send,origin(),enabled);
      return xml('<Hangup/>');
    }
    if(kind==='sms-inbound'){if(!/^SM[a-f0-9]{32}$/i.test(p.MessageSid||''))throw new AppError(400,'Invalid message identifier.');await incomingSMS(db,p);return xml();}
    if(kind==='sms-status'){const id=z.string().uuid().parse(new URL(request.url).searchParams.get('id'));if(!/^SM[a-f0-9]{32}$/i.test(p.MessageSid||''))throw new AppError(400,'Invalid message identifier.');await smsStatus(db,id,p);return xml();}
    throw new AppError(404,'Callback not found.');
  }catch(e){return failure(e);}
}

}
