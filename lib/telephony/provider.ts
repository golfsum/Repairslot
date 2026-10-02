import twilio from 'twilio';
import { AppError, origin, smsReady } from '../booking/config';
import { boundedText } from '../booking/http';

export async function verifiedParams(request:Request) {
  if(!process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_ACCOUNT_SID || !process.env.DATABASE_URL)throw new AppError(503,'Phone integration is not configured.');
  if(!request.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded'))throw new AppError(415,'Form encoding is required.');
  const text=await boundedText(request);
  const form=new URLSearchParams(text);const params:Record<string,string>={};
  for(const [key,value] of form){if(Object.hasOwn(params,key))throw new AppError(400,'Duplicate callback field.');params[key]=value;}
  const url=new URL(request.url);
  // Use configured public origin, never a forwarded/Host header supplied by a caller.
  if(!twilio.validateRequest(process.env.TWILIO_AUTH_TOKEN,request.headers.get('x-twilio-signature')||'',origin()+url.pathname+url.search,params))throw new AppError(403,'Invalid provider signature.');
  if(params.AccountSid!==process.env.TWILIO_ACCOUNT_SID)throw new AppError(403,'Unexpected provider account.');
  return params;
}
export const xmlEscape=(value:string)=>value.replace(/[<>&"']/g,char=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[char]!));
export function xml(body=''){return new Response(`<?xml version="1.0" encoding="UTF-8"?><Response>${body}</Response>`,{headers:{'Content-Type':'text/xml','Cache-Control':'no-store'}});}
export type SendSMS=(data:{from:string;to:string;body:string;statusCallback:string})=>Promise<{sid:string}>;
export const sendSMS:SendSMS=async data=>{
  // Production-only transport. Tests inject a fake sender and previews cannot spend money.
  if(!smsReady() || process.env.NODE_ENV==='test' || (process.env.VERCEL_ENV && process.env.VERCEL_ENV!=='production'))throw new AppError(503,'Live messaging is inactive.');
  const client=twilio(process.env.TWILIO_ACCOUNT_SID,process.env.TWILIO_AUTH_TOKEN,{timeout:10000,autoRetry:false});
  const result=await client.messages.create(data);return{sid:result.sid};
};
