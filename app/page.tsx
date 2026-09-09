'use client';

import { useState } from 'react';
import { ArrowRight, CalendarCheck, Check, Clock3, Code2, ExternalLink, Globe2, MonitorSmartphone, PhoneMissed, Play, ShieldCheck, Wrench } from 'lucide-react';

const repairTypes = [
  ['Appliance Repair','/appliance-repair-scheduling-software'],
  ['Garage Door Repair','/garage-door-repair-scheduling-software'],
  ['Mobile Mechanic','/mobile-mechanic-scheduling-software'],
  ['HVAC Repair','/hvac-repair-scheduling-software'],
  ['Plumbing Repair','/plumbing-repair-scheduling-software'],
  ['Handyman','/handyman-scheduling-software'],
] as const;
const services = ['Refrigerator not cooling', 'Washer leaking', 'Dryer not heating', 'Dishwasher not draining'];
const slots = ['Tomorrow, 8–10 AM', 'Tomorrow, 10 AM–12 PM', 'Tomorrow, 1–3 PM'];
const checkout: Record<string, string> = {
  Starter: 'https://buy.stripe.com/test_14AaEQgLLgJ244S96ScMM00',
  Pro: 'https://buy.stripe.com/test_7sY7sEbrr0K444SgzkcMM01',
  Business: 'https://buy.stripe.com/test_3cIbIUbrr78satg4QCcMM02',
};

export default function Home() {
  const [step, setStep] = useState(1);
  const [service, setService] = useState(services[0]);
  const [slot, setSlot] = useState(slots[0]);
  const [booked, setBooked] = useState(false);

  return (
    <main>
      <header className="nav shell">
        <a className="brand" href="#top"><span className="brandMark"><Wrench size={18}/></span><span>RepairSlot</span></a>
        <nav><a href="#install">Install</a><a href="#how">How it works</a><a href="#pricing">Pricing</a><a className="button buttonSmall" href="/book/demo">Try live demo</a></nav>
      </header>

      <section className="hero shell" id="top">
        <div className="heroCopy">
          <div className="eyebrow">24/7 online booking for repair businesses</div>
          <h1>Turn repair requests into <span>booked jobs.</span></h1>
          <p className="heroText">Give customers real appointment windows instead of “we’ll call you back.” Add RepairSlot to your existing site, embed a full booking page, or share your hosted booking link anywhere.</p>
          <div className="heroActions"><a className="button" href="/book/demo">Try the live booking demo <ArrowRight size={17}/></a><a className="ghostButton" href="#install">See install options</a></div>
          <div className="proofRow"><span><Check size={16}/> No website rebuild</span><span><Check size={16}/> Works after hours</span><span><Check size={16}/> Mobile-first</span></div>
        </div>

        <div className="heroCard" id="demo">
          <div className="demoHeader"><div><strong>Sunset Appliance Repair</strong><span>Live booking preview</span></div><span className="stepPill">{Math.min(step,3)}/3</span></div>
          {!booked && step===1 && <div className="demoBody"><label>What needs repair?</label><div className="choiceGrid">{services.map(item=><button key={item} onClick={()=>setService(item)} className={service===item?'choice active':'choice'}>{item}</button>)}</div><button className="button full" onClick={()=>setStep(2)}>Continue <ArrowRight size={17}/></button></div>}
          {!booked && step===2 && <div className="demoBody"><label>Where should the technician go?</label><input defaultValue="7421 E Broadway Blvd, Tucson, AZ"/><div className="microcopy"><ShieldCheck size={15}/> Service area verified</div><button className="button full" onClick={()=>setStep(3)}>See available times <ArrowRight size={17}/></button></div>}
          {!booked && step===3 && <div className="demoBody"><label>Choose a real service window</label><div className="choiceGrid">{slots.map(item=><button key={item} onClick={()=>setSlot(item)} className={slot===item?'choice active':'choice'}>{item}</button>)}</div><button className="button full" onClick={()=>setBooked(true)}>Book this slot <CalendarCheck size={17}/></button></div>}
          {booked && <div className="successState"><span className="successIcon"><Check size={24}/></span><h3>Repair booked</h3><p>{service}</p><strong>{slot}</strong><button className="ghostButton" onClick={()=>{setBooked(false);setStep(1)}}>Restart demo</button></div>}
        </div>
      </section>

      <section className="problemBand"><div className="shell metrics"><div><span className="metricIcon"><PhoneMissed/></span><strong>Missed call?</strong><p>Text the customer a booking link automatically.</p></div><div><span className="metricIcon"><Clock3/></span><strong>After hours?</strong><p>Customers can still reserve an actual service window.</p></div><div><span className="metricIcon"><CalendarCheck/></span><strong>No callback loop.</strong><p>Show availability and confirm the job while intent is high.</p></div></div></section>

      <section className="section shell" id="install">
        <div className="sectionIntro"><div className="eyebrow">Put it anywhere</div><h2>One booking system. Three ways customers can use it.</h2><p>Every RepairSlot business gets a hosted booking page plus website install options. The same services, hours, technicians and availability power all three.</p></div>
        <div className="installGrid">
          <article className="installCard"><span className="installIcon"><Globe2/></span><h3>Hosted booking page</h3><p>Share a link like <strong>repairslot.com/book/your-shop</strong> in Google Business Profile, texts, email, social media or QR codes.</p><a href="/book/demo">Open demo page <ExternalLink size={15}/></a></article>
          <article className="installCard featuredInstall"><span className="installIcon"><MonitorSmartphone/></span><h3>Full page on your site</h3><p>Embed the complete booking experience inside <strong>yourdomain.com/book</strong> so customers never feel like they left your website.</p><div className="miniBrowser"><div className="browserBar"><i/><i/><i/><span>abc-repair.com/book</span></div><div className="browserBody"><strong>Book a repair</strong><div className="fakeInput">What needs repair?</div><div className="fakeInput">Choose a time</div><div className="fakeButton">Continue</div></div></div></article>
          <article className="installCard"><span className="installIcon"><Code2/></span><h3>Floating booking widget</h3><p>Add one script to any site. A “Book a Repair” button opens the same booking flow over the current page.</p><pre>{`<script src="https://repairslot.com/widget.js"\n  data-slug="your-shop"></script>`}</pre></article>
        </div>
      </section>

      <section className="section embedSection">
        <div className="shell embedLayout">
          <div className="sectionIntro narrow"><div className="eyebrow">Try the inline version</div><h2>This can live directly inside the client’s website.</h2><p>The frame on the right is the actual RepairSlot demo page embedded inline, not a screenshot. Customers can complete the booking flow without leaving the business website.</p><a className="button" href="/book/demo">Open full demo <ArrowRight size={16}/></a></div>
          <div className="siteMock"><div className="siteMockTop"><span>Desert Fix Appliance Repair</span><small>Services &nbsp; Reviews &nbsp; Book Online</small></div><iframe title="RepairSlot inline booking demo" src="/book/demo?embed=1"/></div>
        </div>
      </section>

      <section className="section shell" id="how"><div className="sectionIntro"><div className="eyebrow">How it works</div><h2>Built around a repair job, not an empty calendar.</h2><p>RepairSlot asks what is broken first, then shows only times that fit the job, service area and technician availability.</p></div><div className="steps">{[['1','Customer describes the repair','Use repair-specific questions instead of a generic meeting type.'],['2','RepairSlot finds valid availability','Match duration, hours, technician availability and service area.'],['3','The job gets booked','Confirm instantly, send reminders and recover abandoned bookings.']].map(([n,t,x])=><article className="step" key={n}><span>{n}</span><h3>{t}</h3><p>{x}</p></article>)}</div></section>

      <section className="section videoSection"><div className="shell videoCard"><div><div className="eyebrow lightBlue">60-second product tour</div><h2>See the whole customer journey.</h2><p>From “my refrigerator stopped cooling” to a confirmed service window, plus how the business adds the hosted page, inline embed and widget.</p><div className="videoNote">Narration spec: warm, natural U.S. voice, conversational pacing, no synthetic announcer tone.</div></div><div className="videoPlaceholder"><span className="playCircle"><Play fill="currentColor"/></span><strong>RepairSlot product tour</strong><small>Voice-over version will sit here once the recorded narration asset is available.</small></div></div></section>

      <section className="section industrySection"><div className="shell"><div className="sectionIntro narrow"><div className="eyebrow">Repair-specific templates</div><h2>Start with the repairs you already do.</h2></div><div className="industryGrid">{repairTypes.map(([type,href])=><a className="industry" href={href} key={type}><Wrench size={18}/><span>{type}</span><ArrowRight size={15}/></a>)}</div></div></section>

      <section className="section shell" id="pricing"><div className="sectionIntro narrow"><div className="eyebrow">Simple pricing</div><h2>Priced to pay for itself with one recovered job.</h2></div><div className="pricingGrid">{[
        {name:'Starter',price:'$49',desc:'For solo repair businesses',features:['1 technician','Hosted booking page','Inline embed + widget','Calendar sync','Email/SMS reminders']},
        {name:'Pro',price:'$99',desc:'For growing repair teams',featured:true,features:['Up to 5 technicians','Everything in Starter','Missed-call text-back','Abandoned booking recovery','Deposits + analytics']},
        {name:'Business',price:'$199',desc:'For larger teams and locations',features:['Unlimited technicians','Multiple locations','Route-aware scheduling','Advanced automations','Priority support']},
      ].map(plan=><article className={plan.featured?'priceCard featured':'priceCard'} key={plan.name}>{plan.featured&&<div className="popular">Most popular</div>}<h3>{plan.name}</h3><p>{plan.desc}</p><div className="price"><strong>{plan.price}</strong><span>/month</span></div><a className={plan.featured?'button full':'ghostButton full'} href={checkout[plan.name]}>Start test checkout</a><ul>{plan.features.map(f=><li key={f}><Check size={15}/>{f}</li>)}</ul></article>)}</div></section>

      <section className="cta"><div className="shell ctaInner"><div><div className="eyebrow light">Repair jobs should not wait for a callback.</div><h2>Let customers book while they are ready to hire.</h2></div><a className="button lightButton" href="/book/demo">Try the demo <ArrowRight size={17}/></a></div></section>
      <footer className="footer shell"><div className="brand"><span className="brandMark"><Wrench size={16}/></span><span>RepairSlot</span></div><span>Hosted page · Inline embed · Website widget</span></footer>
    </main>
  );
}
