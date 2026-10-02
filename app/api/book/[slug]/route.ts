import { database } from '../../../../lib/booking/db';
import { requireBooking, AppError, smsReady } from '../../../../lib/booking/config';
import { business, availableSlots, book, rateLimit, ipKey } from '../../../../lib/booking/service';
import { failure, jsonBody } from '../../../../lib/booking/http';
import { requireSameOrigin } from '../../../../lib/booking/auth';
export const runtime='nodejs';
export const dynamic='force-dynamic';
type Context={params:Promise<{slug:string}>};
export async function GET(request:Request,context:Context){
  try{
    requireBooking();const {slug}=await context.params;const db=database();
    await rateLimit(db,`read:${ipKey(request,process.env.BOOKING_TOKEN_SECRET!)}`,240,60);
    const b=await business(db,slug);if(!b.booking_enabled)throw new AppError(503,'Online booking is not active for this business.');
    const url=new URL(request.url);const serviceId=url.searchParams.get('serviceId');const date=url.searchParams.get('date');
    const services=(await db.query('SELECT id,name,duration_minutes FROM services WHERE business_id=$1 AND active=true ORDER BY name',[b.id])).rows;
    const slots=serviceId&&date ? await availableSlots(db,b,serviceId,date):[];
    return Response.json({name:b.name,timezone:b.timezone,services,slots:slots.map(({startsAt,endsAt})=>({startsAt,endsAt})),postalCodes:b.postal_codes,smsAvailable:smsReady()&&b.sms_enabled&&b.routing_verified},{headers:{'Cache-Control':'no-store'}});
  }catch(e){return failure(e);}
}
export async function POST(request:Request,context:Context){
  try{
    requireBooking();requireSameOrigin(request);const {slug}=await context.params;const db=database();
    await rateLimit(db,`book:${ipKey(request,process.env.BOOKING_TOKEN_SECRET!)}`,20);
    const result=await book(db,slug,await jsonBody(request),process.env.BOOKING_TOKEN_SECRET!);
    return Response.json(result,{status:201,headers:{'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});
  }catch(e){return failure(e);}
}
