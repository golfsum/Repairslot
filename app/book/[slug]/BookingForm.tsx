'use client';
import { useEffect, useState } from 'react';
import { Wrench, Check, ArrowLeft } from 'lucide-react';
type Slot={startsAt:string;endsAt:string};
type Info={name:string;timezone:string;services:{id:string;name:string;duration_minutes:number}[];slots:Slot[];postalCodes:string[];smsAvailable:boolean};
type Confirmation={id:string;status:string;startsAt:string;endsAt:string;timezone:string;token?:string;service?:string;businessName?:string};
const localDate=(timezone:string)=>new Intl.DateTimeFormat('en-CA',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
function display(value:string,zone:string){return new Intl.DateTimeFormat('en-US',{timeZone:zone,weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short'}).format(new Date(value));}
export default function BookingForm({slug}:{slug:string}){
  const [info,setInfo]=useState<Info>();const [service,setService]=useState('');const [date,setDate]=useState('');const [slots,setSlots]=useState<Slot[]>([]);const [selected,setSelected]=useState('');const [error,setError]=useState('');const [loading,setLoading]=useState(true);const [busy,setBusy]=useState(false);const [result,setResult]=useState<Confirmation>();const [token,setToken]=useState('');const [key,setKey]=useState('');const [embed,setEmbed]=useState(false);
  async function request(url:string,options?:RequestInit){const response=await fetch(url,options);const body=await response.json();if(!response.ok)throw new Error(body.error||'Please try again.');return body;}
  useEffect(()=>{
    let active=true;setEmbed(new URLSearchParams(location.search).get('embed')==='1');setKey(crypto.randomUUID());
    const fragment=new URLSearchParams(location.hash.slice(1));const saved=fragment.get('booking');
    if(saved){setToken(saved);request(`/api/book/${slug}/manage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:saved})}).then(body=>{if(active)setResult(body);}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});}
    else request(`/api/book/${slug}`).then(body=>{if(active){setInfo(body);setService(body.services[0]?.id||'');setDate(localDate(body.timezone));}}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});
    return()=>{active=false;};
  },[slug]);
  useEffect(()=>{
    if(!service||!date)return;const controller=new AbortController();setSelected('');setSlots([]);setBusy(true);
    request(`/api/book/${slug}?serviceId=${encodeURIComponent(service)}&date=${encodeURIComponent(date)}`,{signal:controller.signal}).then(body=>{setSlots(body.slots);setError('');}).catch(e=>{if(e.name!=='AbortError')setError(e.message);}).finally(()=>{if(!controller.signal.aborted)setBusy(false);});return()=>controller.abort();
  },[slug,service,date]);
  async function submit(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();if(busy||!selected)return;setBusy(true);setError('');const form=new FormData(event.currentTarget);
    try{
      const body=await request(`/api/book/${slug}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({serviceId:service,startsAt:selected,customerName:form.get('customerName'),phone:form.get('phone'),address:form.get('address'),postalCode:form.get('postalCode'),smsConsent:form.get('smsConsent')==='on',website:form.get('website'),idempotencyKey:key})});
      setResult(body);setToken(body.token);history.replaceState(null,'',`${location.pathname}${location.search}#booking=${body.token}`);
    }catch(e){setError(e instanceof Error?e.message:'Booking could not be saved.');}finally{setBusy(false);}
  }
  async function cancel(){if(!confirm('Cancel this repair appointment?'))return;setBusy(true);setError('');try{setResult(await request(`/api/book/${slug}/manage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,cancel:true})}));}catch(e){setError(e instanceof Error?e.message:'Cancellation failed.');}finally{setBusy(false);}}
  return <main className={embed?'bookingPage embedded':'bookingPage'}>
    {!embed&&<header className="bookingTop"><a href="/" className="brand"><span className="brandMark"><Wrench size={16}/></span>RepairSlot</a><a href="/"><ArrowLeft size={15}/>Back to site</a></header>}
    <section className="bookingShell"><div className="businessIntro"><div className="businessLogo"><Wrench/></div><div><h1>{info?.name||result?.businessName||'Book a repair'}</h1><p>{info?'Appointment times are shown in '+info.timezone:'Secure online booking'}</p></div></div>
      {loading&&<p role="status">Loading booking details…</p>}
      {error&&<div className="bookingAlert" role="alert">{error}{!info&&!result&&<p>Please contact the business directly. <a href="/book/demo">Explore the sample demo</a></p>}</div>}
      {result&&<div className="bookingCard bookingSuccess"><span><Check/></span><h2>{result.status==='cancelled'?'Appointment cancelled':'Repair appointment confirmed'}</h2><p>{result.service||info?.services.find(s=>s.id===service)?.name}</p><strong>{display(result.startsAt,result.timezone)}</strong><p>Reference: {result.id.slice(0,8)}</p><p className="manageNote">Save this page link to review or cancel your appointment. Keep it private. No email or text confirmation is sent.</p>{result.status==='confirmed'&&<button className="ghostButton" disabled={busy} onClick={cancel}>Cancel appointment</button>}</div>}
      {info&&!result&&<form onSubmit={submit} className="bookingCard bookingBody liveBookingForm">
        <h2>Choose your repair and appointment</h2><label htmlFor="service">Repair service</label><select id="service" value={service} onChange={e=>{setService(e.target.value);setKey(crypto.randomUUID());}} required>{info.services.map(s=><option key={s.id} value={s.id}>{s.name} ({s.duration_minutes} min)</option>)}</select>
        {!info.services.length&&<p>No services are available online. Please contact the business.</p>}
        <label htmlFor="date">Appointment date</label><input id="date" type="date" value={date} min={localDate(info.timezone)} onChange={e=>{setDate(e.target.value);setKey(crypto.randomUUID());}} required/>
        <fieldset className="slotOptions"><legend>Available service windows</legend>{busy&&<p role="status">Checking availability…</p>}{!busy&&!slots.length&&<p>No windows available for this date. Choose another date.</p>}{slots.map(s=><label key={s.startsAt} className={selected===s.startsAt?'bookingChoice selected':'bookingChoice'}><input type="radio" name="slot" value={s.startsAt} checked={selected===s.startsAt} onChange={()=>{setSelected(s.startsAt);setKey(crypto.randomUUID());}} required/>{display(s.startsAt,info.timezone)} to {new Intl.DateTimeFormat('en-US',{timeZone:info.timezone,hour:'numeric',minute:'2-digit'}).format(new Date(s.endsAt))}</label>)}</fieldset>
        <h2>Your contact details</h2><label htmlFor="customerName">Your name</label><input id="customerName" name="customerName" autoComplete="name" minLength={2} maxLength={100} required onChange={()=>setKey(crypto.randomUUID())}/>
        <label htmlFor="phone">Phone number, including country code</label><input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+15551234567" pattern="\+[1-9][0-9]{7,14}" required onChange={()=>setKey(crypto.randomUUID())}/>
        <label htmlFor="address">Street address</label><input id="address" name="address" autoComplete="street-address" minLength={8} maxLength={300} required onChange={()=>setKey(crypto.randomUUID())}/>
        <label htmlFor="postalCode">ZIP code</label><input id="postalCode" name="postalCode" autoComplete="postal-code" inputMode="numeric" pattern="[0-9]{5}" maxLength={5} required onChange={()=>setKey(crypto.randomUUID())}/><small>Served ZIP codes: {info.postalCodes.join(', ')}</small>
        {info.smsAvailable&&<label className="consentCheckbox"><input type="checkbox" name="smsConsent" onChange={()=>setKey(crypto.randomUUID())}/>I agree to receive a booking-link text if I later call this business and request one. Message and data rates may apply. Reply STOP to opt out. Consent is optional and is not required to book.</label>}
        <div className="honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
        <p>Your contact details and address are shared with this business to arrange the repair. Save the confirmation link after booking. No reminders or automatic confirmations are sent.</p>
        <button className="button full" type="submit" disabled={busy||!selected}>{busy?'Please wait…':'Confirm repair appointment'}</button>
      </form>}
      <div className="bookingTrust">Booking powered by RepairSlot</div>
    </section></main>;
}
