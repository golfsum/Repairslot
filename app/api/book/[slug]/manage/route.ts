import { database } from '../../../../../lib/booking/db';
import { AppError } from '../../../../../lib/booking/config';
import { manageBooking, rateLimit, ipKey } from '../../../../../lib/booking/service';
import { failure, jsonBody } from '../../../../../lib/booking/http';
import { requireSameOrigin } from '../../../../../lib/booking/auth';
import { z } from 'zod';
export const runtime='nodejs';
export async function POST(request:Request,context:{params:Promise<{slug:string}>}){
  try{
    // Existing customers can still cancel when new booking is paused.
    if(!process.env.DATABASE_URL || !process.env.BOOKING_TOKEN_SECRET)throw new AppError(503,'Booking management is unavailable.');
    requireSameOrigin(request);const {slug}=await context.params;const db=database();
    await rateLimit(db,`manage:${ipKey(request,process.env.BOOKING_TOKEN_SECRET)}`,60,60);
    const input=z.object({token:z.string(),cancel:z.boolean().default(false)}).strict().parse(await jsonBody(request));
    return Response.json(await manageBooking(db,slug,input.token,input.cancel),{headers:{'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});
  }catch(e){return failure(e);}
}
