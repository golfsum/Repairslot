import type { Metadata } from 'next';
import { Wrench } from 'lucide-react';
import Calculator from './Calculator';

export const metadata: Metadata = {
  title: { absolute: 'Missed Call Revenue Calculator for Repair Businesses' },
  description: 'Free missed-call revenue calculator for repair businesses. Estimate how much monthly revenue may be lost when customers call and nobody answers.',
  alternates: { canonical: '/tools/missed-call-revenue-calculator' },
};

export default function Page(){
  return <main className="seoPage">
    <header className="nav shell"><a className="brand" href="/"><span className="brandMark"><Wrench size={18}/></span><span>RepairSlot</span></a><nav><a href="/#pricing">Pricing</a><a className="button buttonSmall" href="/book/demo">Try demo</a></nav></header>
    <section className="seoHero shell"><div className="eyebrow">Free tool for repair businesses</div><h1>Missed Call Revenue Calculator</h1><p>Estimate how much repair revenue may be slipping away when customers call, get no answer, and move on to another company.</p></section>
    <section className="shell calcSection"><Calculator/></section>
    <section className="section shell"><div className="sectionIntro"><div className="eyebrow">Why it matters</div><h2>A missed call is often a customer who is ready to book now.</h2><p>RepairSlot is designed to give missed callers a fast path back into a real booking flow. The goal is not to replace every phone call. It is to make sure after-hours and unanswered calls still have a chance to become booked jobs.</p></div><div className="steps"><article className="step"><span>1</span><h3>Customer calls</h3><p>Your team is on another job or the call comes in after hours.</p></article><article className="step"><span>2</span><h3>Booking link goes out</h3><p>The customer gets a direct path to choose the repair and see available service windows.</p></article><article className="step"><span>3</span><h3>The job gets booked</h3><p>Instead of waiting for a callback, the customer can reserve a valid appointment.</p></article></div></section>
    <section className="cta"><div className="shell ctaInner"><div><div className="eyebrow light">Stop letting missed calls end the conversation.</div><h2>Turn more repair inquiries into booked jobs.</h2></div><a className="button lightButton" href="/book/demo">Try the booking demo</a></div></section>
  </main>
}