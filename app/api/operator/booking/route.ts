import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { database } from '../../../../lib/booking/db';
import { requireOperator, requireSameOrigin } from '../../../../lib/booking/auth';
import { bookingReady, smsReady, AppError } from '../../../../lib/booking/config';
import { businessInput, serviceInput, windowInput } from '../../../../lib/booking/service';
import { failure, jsonBody } from '../../../../lib/booking/http';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request:Request){
  try{
    requireOperator(request);
    const readiness={database:Boolean(process.env.DATABASE_URL),booking:bookingReady(),sms:smsReady(),routing:process.env.PHONE_ROUTING_ENABLED==='true',origin:Boolean(process.env.APP_ORIGIN)};
    if(!readiness.database)return Response.json({readiness,businesses:[]},{headers:{'Cache-Control':'no-store'}});
    const db=database();const businesses=(await db.query('SELECT id,slug,name,timezone,postal_codes,booking_enabled,phone_number,forward_number,sms_enabled,routing_verified,consent_notice FROM businesses ORDER BY name')).rows;
    const id=new URL(request.url).searchParams.get('businessId');
    let details={services:[] as any[],resources:[] as any[],availability:[] as any[],bookings:[] as any[],messages:[] as any[]};
    if(id){z.string().uuid().parse(id);if(!businesses.some(b=>b.id===id))throw new AppError(404,'Business not found.');
      const [services,resources,availability,bookings,messages]=await Promise.all([
        db.query('SELECT id,name,duration_minutes,active FROM services WHERE business_id=$1 ORDER BY name',[id]),
        db.query('SELECT id,name FROM resources WHERE business_id=$1 ORDER BY name',[id]),
        db.query('SELECT id,resource_id,starts_at,ends_at FROM availability WHERE business_id=$1 AND ends_at>now() ORDER BY starts_at LIMIT 200',[id]),
        db.query('SELECT id,service_id,starts_at,ends_at,customer_name,phone,address,postal_code,status FROM bookings WHERE business_id=$1 ORDER BY created_at DESC LIMIT 100',[id]),
        db.query('SELECT id,state,error_code,created_at FROM sms_outbox WHERE business_id=$1 ORDER BY created_at DESC LIMIT 50',[id])
      ]);details={services:services.rows,resources:resources.rows,availability:availability.rows,bookings:bookings.rows,messages:messages.rows};
    }
    return Response.json({readiness,businesses,...details},{headers:{'Cache-Control':'no-store'}});
  }catch(e){return failure(e);}
}
export async function POST(request:Request){
  try{
    requireOperator(request);requireSameOrigin(request);const raw=z.object({action:z.string(),businessId:z.string().uuid().optional(),data:z.record(z.string(),z.unknown())}).strict().parse(await jsonBody(request));const db=database();
    const action=z.enum(['business','service','resource','availability','remove-availability','cancel']).parse(raw.action);
    const id=raw.businessId ? z.string().uuid().parse(raw.businessId):randomUUID();
    const result=await db.transaction(async tx=>{
      if(action==='business'){
        const input=businessInput.parse(raw.data);
        if(raw.businessId){const found=(await tx.query('SELECT id,slug,phone_number FROM businesses WHERE id=$1 FOR UPDATE',[id])).rows[0];if(!found)throw new AppError(404,'Business not found.');if(found.slug!==input.slug)throw new AppError(409,'Booking slugs are permanent so saved customer links keep working.');if(found.phone_number && found.phone_number!==(input.phoneNumber||null))throw new AppError(409,'A configured phone number cannot be reassigned here. Contact the operator for a reviewed routing migration.');}
        await tx.query(`INSERT INTO businesses(id,slug,name,timezone,postal_codes,booking_enabled,phone_number,forward_number,sms_enabled,routing_verified,consent_notice) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
          ON CONFLICT(id) DO UPDATE SET slug=EXCLUDED.slug,name=EXCLUDED.name,timezone=EXCLUDED.timezone,postal_codes=EXCLUDED.postal_codes,booking_enabled=EXCLUDED.booking_enabled,phone_number=EXCLUDED.phone_number,forward_number=EXCLUDED.forward_number,sms_enabled=EXCLUDED.sms_enabled,routing_verified=EXCLUDED.routing_verified,consent_notice=EXCLUDED.consent_notice`,[id,input.slug,input.name,input.timezone,input.postalCodes,input.bookingEnabled,input.phoneNumber||null,input.forwardNumber||null,input.smsEnabled,input.routingVerified,input.consentNotice]);
        return{id};
      }
      if(!raw.businessId)throw new AppError(400,'Select a business.');
      if(!(await tx.query('SELECT id FROM businesses WHERE id=$1 FOR UPDATE',[id])).rows[0])throw new AppError(404,'Business not found.');
      if(action==='service'){const input=serviceInput.parse(raw.data);const serviceId=randomUUID();await tx.query('INSERT INTO services(business_id,id,name,duration_minutes) VALUES($1,$2,$3,$4)',[id,serviceId,input.name,input.durationMinutes]);return{id:serviceId};}
      if(action==='resource'){const name=z.string().trim().min(2).max(100).parse(raw.data.name);const resourceId=randomUUID();await tx.query('INSERT INTO resources(business_id,id,name) VALUES($1,$2,$3)',[id,resourceId,name]);return{id:resourceId};}
      if(action==='availability'){const input=windowInput.parse(raw.data);const windowId=randomUUID();if(!(await tx.query('SELECT id FROM resources WHERE business_id=$1 AND id=$2',[id,input.resourceId])).rows[0])throw new AppError(404,'Technician not found.');await tx.query('INSERT INTO availability(business_id,id,resource_id,starts_at,ends_at) VALUES($1,$2,$3,$4,$5)',[id,windowId,input.resourceId,input.startsAt,input.endsAt]);return{id:windowId};}
      const itemId=z.string().uuid().parse(raw.data.id);
      if(action==='remove-availability')await tx.query('DELETE FROM availability WHERE business_id=$1 AND id=$2',[id,itemId]);
      else await tx.query("UPDATE bookings SET status='cancelled',cancelled_at=now() WHERE business_id=$1 AND id=$2 AND status='confirmed'",[id,itemId]);
      return{id:itemId};
    });
    return Response.json(result,{headers:{'Cache-Control':'no-store'}});
  }catch(e){return failure(e);}
}
