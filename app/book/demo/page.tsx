'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, CalendarCheck, Check, MapPin, ShieldCheck, Wrench } from 'lucide-react';

const services=['Refrigerator not cooling','Washer leaking','Dryer not heating','Dishwasher not draining'];
const slots=['Tomorrow, 8–10 AM','Tomorrow, 10 AM–12 PM','Tomorrow, 1–3 PM'];

export default function BookingDemo(){
  const [embed,setEmbed]=useState(false);
  const [step,setStep]=useState(1);
  const [service,setService]=useState(services[0]);
  const [slot,setSlot]=useState(slots[0]);
  const [booked,setBooked]=useState(false);
  useEffect(()=>{setEmbed(new URLSearchParams(window.location.search).get('embed')==='1')},[]);
  return <main className={embed?'bookingPage embedded':'bookingPage'}>
    {!embed&&<header className="bookingTop"><a href="/" className="brand"><span className="brandMark"><Wrench size={16}/></span><span>RepairSlot Demo</span></a><a href="/"><ArrowLeft size={15}/> Back to site</a></header>}
    <section className="bookingShell">
      <div className="businessIntro"><div className="businessLogo"><Wrench/></div><div><h1>Sunset Appliance Repair</h1><p>Tucson, AZ · Same-day and next-day service</p></div></div>
      <div className="bookingCard">
        <div className="bookingCardHead"><strong>Book a repair</strong><span>Step {Math.min(step,3)} of 3</span></div>
        {!booked&&step===1&&<div className="bookingBody"><h2>What needs repair?</h2><p>Select the closest match. A technician can confirm the exact issue on site.</p><div className="bookingChoices">{services.map(x=><button className={service===x?'bookingChoice selected':'bookingChoice'} key={x} onClick={()=>setService(x)}>{x}</button>)}</div><button className="button full" onClick={()=>setStep(2)}>Continue</button></div>}
        {!booked&&step===2&&<div className="bookingBody"><h2>Where should we go?</h2><p>We use your address to confirm the service area and available technician windows.</p><label>Service address</label><div className="iconInput"><MapPin size={17}/><input defaultValue="7421 E Broadway Blvd, Tucson, AZ"/></div><div className="serviceVerified"><ShieldCheck size={16}/> Address is inside the service area</div><button className="button full" onClick={()=>setStep(3)}>See available times</button></div>}
        {!booked&&step===3&&<div className="bookingBody"><h2>Choose a service window</h2><p>These are the windows the business has made available for this type of repair.</p><div className="bookingChoices">{slots.map(x=><button className={slot===x?'bookingChoice selected':'bookingChoice'} key={x} onClick={()=>setSlot(x)}>{x}</button>)}</div><button className="button full" onClick={()=>setBooked(true)}>Confirm booking <CalendarCheck size={17}/></button></div>}
        {booked&&<div className="bookingSuccess"><span><Check/></span><h2>You’re booked</h2><p>{service}</p><strong>{slot}</strong><small>Demo only. No real appointment was created.</small><button className="ghostButton" onClick={()=>{setBooked(false);setStep(1)}}>Book another demo</button></div>}
      </div>
      <div className="bookingTrust">Demo booking experience powered by RepairSlot</div>
    </section>
  </main>
}
