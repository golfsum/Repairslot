'use client';

import { useState } from 'react';
import { ArrowRight, CalendarCheck, Check, Clock3, Code2, ExternalLink, Globe2, MonitorSmartphone, PhoneMissed, ShieldCheck, Wrench } from 'lucide-react';

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
export default function Home() {
  const [step, setStep] = useState(1);
  const [service, setService] = useState(services[0]);
  const [slot, setSlot] = useState(slots[0]);
  const [booked, setBooked] = useState(false);

  return (
    <main>
      <header className="nav shell">
        <a className="brand" href="#top"><span className="brandMark"><Wrench size={18}/></span><span>RepairSlot</span></a>
        <nav><a href="#install">Install</a><a href="#how">How it works</a><a href="/resources">Resources</a><a href="#pricing">Pricing</a><a className="button buttonSmall" href="/book/demo">Try live demo</a></nav>
      </header>

      <div className="shell setupNotice"><strong>Explore RepairSlot while live setup is in progress.</strong><p>The public demo uses sample data. Live booking requires business activation. Missed-call texts require provider setup and caller consent. <a href="/readiness">See what is available</a></p></div>

      <section className="hero shell" id="top">
        <div className="heroCopy">
          <div className="eyebrow">24/7 online booking for repair businesses</div>
          <h1>Turn repair requests into <span>booked jobs.</span></h1>
          <p className="heroText">Give customers real appointment windows instead of “we’ll call you back.” Add RepairSlot to your existing site, embed a full booking page, or share your hosted booking link anywhere.</p>
          <div className="heroActions"><a className="button" href="/book/demo">Try the live booking demo <ArrowRight size={17}/></a><a className="ghostButton" href="#install">See install options</a></div>
          <div className="proofRow"><span><Check size={16}/> No website rebuild</span><span><Check size={16}/> Works after hours</span><span><Check size={16}/> Mobile-first</span></div>
        </div>

        <div className="heroCard" id="demo">
          <div className="demoHeader"><div><strong>Sunset Appliance Repair</strong><span>Interactive sample · No real booking</span></div><span className="stepPill">{Math.min(step,3)}/3</span></div>
          {!booked && step===1 && <div className="demoBody"><label>What needs repair?</label><div className="choiceGrid">{services.map(item=><button key={item} onClick={()=>setService(item)} className={service===item?'choice active':'choice'}>{item}</button>)}</div><button className="button full" onClick={()=>setStep(2)}>Continue <ArrowRight size={17}/></button></div>}
          {!booked && step===2 && <div className="demoBody"><label>Where should the technician go?</label><input aria-label="Sample service address" readOnly defaultValue="7421 E Broadway Blvd, Tucson, AZ"/><div className="microcopy"><ShieldCheck size={15}/> Sample address. No address verification</div><button className="button full" onClick={()=>setStep(3)}>See available times <ArrowRight size={17}/></button></div>}
          {!booked && step===3 && <div className="demoBody"><label>Choose a sample service window</label><div className="choiceGrid">{slots.map(item=><button key={item} onClick={()=>setSlot(item)} className={slot===item?'choice active':'choice'}>{item}</button>)}</div><button className="button full" onClick={()=>setBooked(true)}>Finish sample booking <CalendarCheck size={17}/></button></div>}
          {booked && <div className="successState"><span className="successIcon"><Check size={24}/></span><h3>Sample booking complete</h3><p>No real appointment was created.</p><p>{service}</p><strong>{slot}</strong><button className="ghostButton" onClick={()=>{setBooked(false);setStep(1)}}>Restart demo</button></div>}
        </div>
      </section>

      <section className="problemBand"><div className="shell metrics"><div><span className="metricIcon"><PhoneMissed/></span><strong>Missed call?</strong><p>With provider setup and caller consent, send a booking link after an unanswered call.</p></div><div><span className="metricIcon"><Clock3/></span><strong>After hours?</strong><p>Activated businesses can accept bookings in their configured service windows.</p></div><div><span className="metricIcon"><CalendarCheck/></span><strong>No callback loop.</strong><p>Show configured availability and save the appointment after setup.</p></div></div></section>

      <section className="section shell" id="install">
        <div className="sectionIntro"><div className="eyebrow">Put it anywhere</div><h2>One booking system. Three ways customers can use it.</h2><p>After operator setup, businesses can use a hosted booking page, inline embed, or website widget. Services, service-area ZIP codes and technician availability power the booking flow.</p></div>
        <div className="installGrid">
          <article className="installCard"><span className="installIcon"><Globe2/></span><h3>Hosted booking page</h3><p>Share a link like <strong>repairslot.com/book/your-shop</strong> in Google Business Profile, texts, email, social media or QR codes.</p><a href="/book/demo">Open demo page <ExternalLink size={15}/></a></article>
          <article className="installCard featuredInstall"><span className="installIcon"><MonitorSmartphone/></span><h3>Full page on your site</h3><p>Embed the complete booking experience inside <strong>yourdomain.com/book</strong> so customers never feel like they left your website.</p><a href="/embed-demo">View live embedded example <ExternalLink size={15}/></a><div className="miniBrowser"><div className="browserBar"><i/><i/><i/><span>abc-repair.com/book</span></div><div className="browserBody"><strong>Book a repair</strong><div className="fakeInput">What needs repair?</div><div className="fakeInput">Choose a time</div><div className="fakeButton">Continue</div></div></div></article>
          <article className="installCard"><span className="installIcon"><Code2/></span><h3>Floating booking widget</h3><p>Add one script to any site. A “Book a Repair” button opens the same booking flow over the current page.</p><pre>{`<script src="https://repairslot.com/widget.js"\n  data-slug="your-shop"></script>`}</pre></article>
        </div>
      </section>

      <section className="section embedSection">
        <div className="shell embedLayout">
          <div className="sectionIntro narrow"><div className="eyebrow">Try the inline version</div><h2>This can live directly inside the client’s website.</h2><p>The frame on the right is the actual RepairSlot demo page embedded inline, not a screenshot. Customers can complete the booking flow without leaving the business website.</p><a className="button" href="/embed-demo">See it on a real page <ArrowRight size={16}/></a></div>
          <div className="siteMock"><div className="siteMockTop"><span>Desert Fix Appliance Repair</span><small>Services &nbsp; Reviews &nbsp; Book Online</small></div><iframe title="RepairSlot inline booking demo" src="/book/demo?embed=1"/></div>
        </div>
      </section>

      <section className="section shell" id="how"><div className="sectionIntro"><div className="eyebrow">How it works</div><h2>Built around a repair job, not an empty calendar.</h2><p>RepairSlot asks what is broken first, then shows only times that fit the job, service area and technician availability.</p></div><div className="steps">{[['1','Customer describes the repair','Use repair-specific questions instead of a generic meeting type.'],['2','RepairSlot finds valid availability','Match duration, hours, technician availability and service area.'],['3','The job gets booked','Save the appointment and provide a private link to view or cancel it. Reminders and abandoned-booking recovery are not available.']].map(([n,t,x])=><article className="step" key={n}><span>{n}</span><h3>{t}</h3><p>{x}</p></article>)}</div></section>

      <section className="section tourSection" aria-labelledby="tour-title"><div className="shell tourLayout">
        <div className="tourCopy"><div className="eyebrow lightBlue">Explore the booking demo</div><h2 id="tour-title">Take a repair request from problem to service window.</h2><p>Try the customer experience for a sample appliance repair business. Choose a repair, review a sample address, and pick an appointment window.</p><ol className="tourSteps"><li><span>1</span>Choose what needs repair</li><li><span>2</span>Review the service address</li><li><span>3</span>Pick a sample service window</li></ol><a className="button" href="/book/demo">Try the demo <ArrowRight size={17}/></a><p className="tourDisclaimer">No signup needed. Sample data only. No real appointment is created.</p></div>
        <div className="tourPreview"><div className="tourPreviewBar"><Wrench size={16}/><strong>Sunset Appliance Repair</strong><span>Sample</span></div><div className="tourPreviewBody"><div className="eyebrow">Booking preview</div><h3>A service window, selected.</h3><dl className="tourSummary"><div><dt>Repair</dt><dd>Refrigerator not cooling</dd></div><div><dt>Service window</dt><dd><Clock3 size={16}/>Tomorrow, 8–10 AM</dd></div></dl><div className="tourSampleNote"><CalendarCheck size={22}/><div><strong>See the confirmation step</strong><p>Walk through the demo to see how a customer finishes booking.</p></div></div><a href="/book/demo" className="ghostButton full">Open interactive sample <ArrowRight size={16}/></a></div></div>
      </div></section>

      <section className="section industrySection"><div className="shell"><div className="sectionIntro narrow"><div className="eyebrow">Repair-specific templates</div><h2>Start with the repairs you already do.</h2></div><div className="industryGrid">{repairTypes.map(([type,href])=><a className="industry" href={href} key={type}><Wrench size={18}/><span>{type}</span><ArrowRight size={15}/></a>)}</div></div></section>

      <section className="section shell" id="pricing"><div className="sectionIntro narrow"><div className="eyebrow">Planned pricing</div><h2>Explore the demo before subscribing.</h2></div><div className="pricingGrid">{[
        {name:'Starter',featured:false,price:'$49',desc:'Planned for solo repair businesses',features:['Hosted booking after activation','Inline embed + widget','Private appointment cancellation','Calendar sync: not available','Email/SMS reminders: not available']},
        {name:'Pro',featured:false,price:'$99',desc:'Planned for growing repair teams',features:['Technician availability setup','Missed-call text-back: setup required','Caller consent + opt-out controls','Abandoned booking recovery: not available','Deposits + analytics: not available']},
        {name:'Business',featured:false,price:'$199',desc:'Planned for larger teams',features:['Operator-managed business setup','Multiple locations: not available','Route-aware scheduling: not available','Advanced automations: not available','Priority support: not available']},
      ].map(plan=><article className={plan.featured?'priceCard featured':'priceCard'} key={plan.name}><h3>{plan.name}</h3><p>{plan.desc}</p><div className="price"><strong>{plan.price}</strong><span>/month</span></div><p className="planStatus">Subscriptions paused until activation and plan limits are ready.</p><a className="ghostButton full" href="/book/demo">Explore sample demo</a><ul>{plan.features.map(f=><li key={f} data-available={!f.includes("not available")}>{f.includes("not available")?<Clock3 size={15}/>:<Check size={15}/>} {f}</li>)}</ul></article>)}</div></section>

      <section className="cta"><div className="shell ctaInner"><div><div className="eyebrow light">Repair jobs should not wait for a callback.</div><h2>Let customers book while they are ready to hire.</h2></div><a className="button lightButton" href="/book/demo">Try the demo <ArrowRight size={17}/></a></div></section>
      <footer className="footer shell"><div className="brand"><span className="brandMark"><Wrench size={16}/></span><span>RepairSlot</span></div><a href="/repair-scheduling-software">Repair scheduling software</a><a href="/repair-booking-software">Repair booking software</a><a href="/resources">Resources and calculators</a></footer>

    </main>
  );
}
