import { z } from 'zod';

export class AppError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export const slugSchema = z.string().regex(/^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/).refine(s => s !== 'demo');
export const phoneSchema = z.string().regex(/^\+[1-9]\d{7,14}$/, 'Use an international phone number, for example +15551234567.');
export function origin() {
  const value = process.env.APP_ORIGIN;
  if (!value) throw new AppError(503,'Booking setup is not complete.');
  const url = new URL(value);
  if ((url.protocol !== 'https:' && !(process.env.NODE_ENV !== 'production' && url.hostname === 'localhost')) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new AppError(503,'Booking setup is not complete.');
  return url.origin;
}
export function bookingReady() {
  return Boolean(process.env.DATABASE_URL && process.env.BOOKING_TOKEN_SECRET && process.env.BOOKING_TOKEN_SECRET.length >= 32 && process.env.BOOKING_ENABLED === 'true');
}
export function requireBooking() {
  if (!bookingReady()) throw new AppError(503,'Online booking is not active yet. Please contact the business directly.');
  origin();
}
export function smsReady() {
  return bookingReady() && process.env.SMS_ENABLED === 'true' && /^AC[a-f0-9]{32}$/i.test(process.env.TWILIO_ACCOUNT_SID || '') && Boolean(process.env.TWILIO_AUTH_TOKEN);
}
