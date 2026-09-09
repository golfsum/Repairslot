'use client';

import { useMemo, useState } from 'react';
import { ArrowRight, CalendarCheck, Check, Clock3, PhoneMissed, ShieldCheck, Wrench } from 'lucide-react';

const repairTypes = ['Appliance Repair', 'Garage Door Repair', 'Mobile Mechanic', 'HVAC Repair', 'Plumbing Repair', 'Handyman'];
const services = ['Refrigerator not cooling', 'Washer leaking', 'Dryer not heating', 'Dishwasher not draining'];
const slots = ['Tomorrow, 8–10 AM', 'Tomorrow, 10 AM–12 PM', 'Tomorrow, 1–3 PM'];

export default function Home() {
  const [step, setStep] = useState(1);
  const [service, setService] = useState(services[0]);
  const [slot, setSlot] = useState(slots[0]);
  const [booked, setBooked] = useState(false);

  const progress = useMemo(() => `${Math.min(step, 3)}/3`, [step]);

  return (
    <main>
      <header className="nav shell">
        <a className="brand" href="#top" aria-label="RepairSlot home">
          <span className="brandMark"><Wrench size={18} /></span>
          <span>RepairSlot</span>
        </a>
        <nav>
          <a href="#how">How it works</a>
          <a href="#industries">Industries</a>
          <a href="#pricing">Pricing</a>
          <a className="button buttonSmall" href="#demo">See demo</a>
        </nav>
      </header>

      <section className="hero shell" id="top">
        <div className="heroCopy">
          <div className="eyebrow">Built for repair businesses</div>
          <h1>Turn repair requests into <span>booked jobs.</span></h1>
          <p className="heroText">Let customers choose a real service window, book after hours, and recover missed calls before they call your competitor.</p>
          <div className="heroActions">
            <a className="button" href="#demo">Try the booking demo <ArrowRight size={17} /></a>
            <a className="ghostButton" href="#pricing">View pricing</a>
          </div>
          <div className="proofRow">
            <span><Check size={16} /> No AI required</span>
            <span><Check size={16} /> Works on your website</span>
            <span><Check size={16} /> Mobile-first booking</span>
          </div>
        </div>

        <div className="heroCard" id="demo">
          <div className="demoHeader">
            <div><strong>Book a repair</strong><span>Demo customer flow</span></div>
            <span className="stepPill">{progress}</span>
          </div>

          {!booked && step === 1 && (
            <div className="demoBody">
              <label>What needs repair?</label>
              <div className="choiceGrid">
                {services.map((item) => (
                  <button key={item} onClick={() => setService(item)} className={service === item ? 'choice active' : 'choice'}>{item}</button>
                ))}
              </div>
              <button className="button full" onClick={() => setStep(2)}>Continue <ArrowRight size={17} /></button>
            </div>
          )}

          {!booked && step === 2 && (
            <div className="demoBody">
              <label>Where should the technician go?</label>
              <input defaultValue="7421 E Broadway Blvd, Tucson, AZ" aria-label="Service address" />
              <div className="microcopy"><ShieldCheck size={15} /> Service area verified</div>
              <button className="button full" onClick={() => setStep(3)}>See available times <ArrowRight size={17} /></button>
            </div>
          )}

          {!booked && step === 3 && (
            <div className="demoBody">
              <label>Choose a real service window</label>
              <div className="choiceGrid">
                {slots.map((item) => (
                  <button key={item} onClick={() => setSlot(item)} className={slot === item ? 'choice active' : 'choice'}>{item}</button>
                ))}
              </div>
              <button className="button full" onClick={() => setBooked(true)}>Book this slot <CalendarCheck size={17} /></button>
            </div>
          )}

          {booked && (
            <div className="successState">
              <span className="successIcon"><Check size={24} /></span>
              <h3>Repair booked</h3>
              <p>{service}</p>
              <strong>{slot}</strong>
              <button className="ghostButton" onClick={() => { setBooked(false); setStep(1); }}>Restart demo</button>
            </div>
          )}
        </div>
      </section>

      <section className="problemBand">
        <div className="shell metrics">
          <div><span className="metricIcon"><PhoneMissed /></span><strong>Missed call?</strong><p>Automatically text the customer a link to book.</p></div>
          <div><span className="metricIcon"><Clock3 /></span><strong>After hours?</strong><p>Customers can still reserve a real repair window.</p></div>
          <div><span className="metricIcon"><CalendarCheck /></span><strong>No callback loop.</strong><p>Replace “we’ll contact you” forms with actual availability.</p></div>
        </div>
      </section>

      <section className="section shell" id="how">
        <div className="sectionIntro">
          <div className="eyebrow">How it works</div>
          <h2>Simple enough for customers. Smart enough for repair jobs.</h2>
          <p>RepairSlot is not another generic calendar. It asks the right service questions first, then only shows appointment windows that actually fit.</p>
        </div>
        <div className="steps">
          {[
            ['1', 'Customer describes the repair', 'Use simple, industry-specific intake questions instead of a blank appointment type.'],
            ['2', 'RepairSlot finds valid availability', 'Match service duration, business hours, technician availability, and service area.'],
            ['3', 'The job gets booked', 'Confirm instantly, send reminders, and reduce the back-and-forth that loses jobs.'],
          ].map(([n, title, text]) => (
            <article className="step" key={n}><span>{n}</span><h3>{title}</h3><p>{text}</p></article>
          ))}
        </div>
      </section>

      <section className="section industrySection" id="industries">
        <div className="shell">
          <div className="sectionIntro narrow">
            <div className="eyebrow">One platform, repair-specific templates</div>
            <h2>Start with the repairs you already do.</h2>
          </div>
          <div className="industryGrid">
            {repairTypes.map((type) => <div className="industry" key={type}><Wrench size={18} /><span>{type}</span></div>)}
          </div>
        </div>
      </section>

      <section className="section shell" id="pricing">
        <div className="sectionIntro narrow">
          <div className="eyebrow">Simple pricing</div>
          <h2>Priced to pay for itself with one recovered job.</h2>
        </div>
        <div className="pricingGrid">
          {[
            {name:'Starter', price:'$49', desc:'For solo repair businesses', href:'https://buy.stripe.com/test_14AaEQgLLgJ244S96ScMM00', features:['1 technician','Booking page + widget','Service windows','Email confirmations']},
            {name:'Pro', price:'$99', desc:'For growing repair teams', featured:true, href:'https://buy.stripe.com/test_7sY7sEbrr0K444SgzkcMM01', features:['Up to 5 technicians','Missed-call text back','Abandoned booking recovery','SMS + email reminders','Deposits and analytics']},
            {name:'Business', price:'$199', desc:'For larger teams and locations', href:'https://buy.stripe.com/test_3cIbIUbrr78satg4QCcMM02', features:['Unlimited technicians','Multiple locations','Advanced routing rules','Priority support','Custom automations']},
          ].map((plan) => (
            <article className={plan.featured ? 'priceCard featured' : 'priceCard'} key={plan.name}>
              {plan.featured && <div className="popular">Most popular</div>}
              <h3>{plan.name}</h3><p>{plan.desc}</p>
              <div className="price"><strong>{plan.price}</strong><span>/month</span></div>
              <a className={plan.featured ? 'button full' : 'ghostButton full'} href={plan.href}>Start test checkout</a>
              <ul>{plan.features.map(f => <li key={f}><Check size={15} /> {f}</li>)}</ul>
            </article>
          ))}
        </div>
      </section>

      <section className="cta">
        <div className="shell ctaInner">
          <div><div className="eyebrow light">Repair jobs should not wait for a callback.</div><h2>Let customers book the repair while they are ready to hire.</h2></div>
          <a className="button lightButton" href="#pricing">Choose a plan <ArrowRight size={17} /></a>
        </div>
      </section>

      <footer className="footer shell"><div className="brand"><span className="brandMark"><Wrench size={16} /></span><span>RepairSlot</span></div><span>24/7 booking for repair businesses.</span></footer>
    </main>
  );
}
