import { database } from '../../../../lib/booking/db';
import { smsReady } from '../../../../lib/booking/config';
import { sendSMS } from '../../../../lib/telephony/provider';
import { createTelephonyHandler } from '../../../../lib/telephony/handler';
export const runtime='nodejs';
export const POST=createTelephonyHandler({
  database,
  voiceReady:()=>process.env.PHONE_ROUTING_ENABLED==='true' && process.env.NODE_ENV!=='test' && (!process.env.VERCEL_ENV || process.env.VERCEL_ENV==='production'),
  messagingReady:()=>smsReady() && process.env.NODE_ENV!=='test' && (!process.env.VERCEL_ENV || process.env.VERCEL_ENV==='production'),
  send:sendSMS,
});