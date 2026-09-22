'use client';

import { useState } from 'react';
import { ArrowLeft, CalendarCheck, Check, Clock3, MapPin, Phone, ShieldCheck, Wrench } from 'lucide-react';

const services = [
  'Rekey locks',
  'Change or replace locks',
  'Car key replacement',
  'Transponder key service',
  'Lock repair',
  'Commercial lock service'
];

const slots = [
  'Tomorrow · 9–11 AM',
  'Tomorrow · 12–2 PM',
  'Tomorrow · 3–5 PM'
];

export default function IntelLockDemo(){
  const [step,setStep]=useState(1);
  const [service,setService]=useState(services[0]);
  const [slot,setSlot]=useState(slots[0]);
  const [booked,setBooked]=useState(false);

  return <main className="bookingPage">
    <header className="bookingTop">
      <a href="/" className="brand"><span className="brandMark"><Wrench size={16}/></span><span>RepairSlot</span></a>
      <a href="/"><ArrowLeft size={15}/> Back to RepairSlot</a>
    </header>

    <section className="bookingShell">
      <div style={{background:'#fff8e8',border:'1px solid #f1d89c',borderRadius:12,padding:'12px 14px',marginBottom:18,fontSize:13,lineHeight:1.5,color:'#6f5618'}}>
        <strong>Concept preview:</strong> This page was prepared by RepairSlot to demonstrate an online scheduling experience for Intel Lock. It is not an official Intel Lock booking page and no real appointment will be created.
      </div>

      <div className="businessIntro">
        <div className="businessLogo"><Wrench/></div>
        <div>
          <h1>Intel Lock · Tucson Locksmith</h1>
          <p>Sample online scheduling for non-emergency service</p>
        </div>
      </div>

      <div className="bookingCard">
        <div className="bookingCardHead"><strong>Schedule locksmith service</strong><span>Step {Math.min(step,3)} of 3</span></div>

        {!booked && step===1 && <div className="bookingBody">
          <h2>What can we help with?</h2>
          <p>For an active lockout or urgent situation, customers can still call for 24-hour service. This demo shows how scheduled work could be booked online.</p>
          <div className="bookingChoices">
            {services.map(x=><button className={service===x?'bookingChoice selected':'bookingChoice'} key={x} onClick={()=>setService(x)}>{x}</button>)}
          </div>
          <button className="button full" onClick={()=>setStep(2)}>Continue</button>
          <a href="tel:5202990125" className="ghostButton full"><Phone size={16}/> Emergency? Call 520-299-0125</a>
        </div>}

        {!booked && step===2 && <div className="bookingBody">
          <h2>Where is service needed?</h2>
          <p>A booking flow can check the service area before offering appointment windows.</p>
          <label>Service address</label>
          <div className="iconInput"><MapPin size={17}/><input placeholder="Enter a Tucson-area address"/></div>
          <div className="serviceVerified"><ShieldCheck size={16}/> Demo assumes an address inside the service area</div>
          <button className="button full" onClick={()=>setStep(3)}>See sample availability</button>
          <button className="ghostButton full" onClick={()=>setStep(1)}>Back</button>
        </div>}

        {!booked && step===3 && <div className="bookingBody">
          <h2>Choose an appointment window</h2>
          <p>These are sample windows only. In a live RepairSlot setup, Intel Lock would control which services, hours and appointment windows customers can select.</p>
          <div className="bookingChoices">
            {slots.map(x=><button className={slot===x?'bookingChoice selected':'bookingChoice'} key={x} onClick={()=>setSlot(x)}><span style={{display:'flex',alignItems:'center',gap:8}}><Clock3 size={16}/>{x}</span></button>)}
          </div>
          <button className="button full" onClick={()=>setBooked(true)}>Preview confirmation <CalendarCheck size={17}/></button>
          <button className="ghostButton full" onClick={()=>setStep(2)}>Back</button>
        </div>}

        {booked && <div className="bookingSuccess">
          <span><Check/></span>
          <h2>This is what the customer would see</h2>
          <p>{service}</p>
          <strong>{slot}</strong>
          <small>Demo only. No appointment was created and nothing was sent to Intel Lock.</small>
          <button className="ghostButton" onClick={()=>{setBooked(false);setStep(1)}}>Restart demo</button>
        </div>}
      </div>

      <div className="bookingTrust">Concept scheduling experience powered by RepairSlot</div>

      <div style={{marginTop:22,background:'#fff',border:'1px solid var(--line)',borderRadius:16,padding:22,textAlign:'center'}}>
        <strong style={{display:'block',fontSize:18,marginBottom:7}}>Want this on the Intel Lock website?</strong>
        <p style={{margin:'0 auto 16px',maxWidth:500,color:'var(--muted)',lineHeight:1.55,fontSize:14}}>RepairSlot can provide a hosted booking page or an embedded booking flow while keeping 24/7 emergency calls available exactly as they are now.</p>
        <a className="button" href="mailto:noel@repairslot.com?subject=Intel%20Lock%20RepairSlot%20demo">Talk to Noel at RepairSlot</a>
      </div>
    </section>
  </main>
}
