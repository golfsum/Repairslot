import { timingSafeEqual, createHash } from 'node:crypto';
import { AppError, origin } from './config';

// Existing deployment operator credential. Business owners never receive it.
export function requireOperator(request: Request) {
  const password=process.env.ADMIN_PASSWORD;
  if(!password) throw new AppError(503,'Operator access is not configured.');
  const auth=request.headers.get('authorization') || '';
  let supplied='';
  try { if(auth.startsWith('Basic ')){const decoded=Buffer.from(auth.slice(6),'base64').toString();const colon=decoded.indexOf(':');if(colon>=0)supplied=decoded.slice(colon+1);} } catch {}
  if(!supplied || !timingSafeEqual(createHash('sha256').update(supplied).digest(),createHash('sha256').update(password).digest())) throw new AppError(401,'Operator authentication required.');
}
export function requireSameOrigin(request: Request) {
  if(request.headers.get('origin') !== origin()) throw new AppError(403,'Request origin is not allowed.');
}
