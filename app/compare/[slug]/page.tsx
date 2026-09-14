import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {ArrowRight,Check,Wrench} from 'lucide-react';
import {competitorPages,competitorSlugs} from '../../../lib/competitor-seo';

export function generateStaticParams(){return competitorSlugs.map(slug=>({slug}));}

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params;
  const page=competitorPages.find(x=>x.slug===slug);
  if(!page) notFound();
  return {
    title:{absolute:`${page.title} | RepairSlot`},
    description:page.description,
    alternates:{canonical:`/compare/${page.slug}`},
    openGraph:{title:`${page.title} | RepairSlot`,description:page.description,url:`https://repairslot.com/compare/${page.slug}`}
  };
}

export default async function ComparePage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const page=competitorPages.find(x=>x.slug===slug);
  if(!page) notFound();
  const faqSchema={'@context':'https://schema.org','@type':'FAQPage',mainEntity:page.questions.map(x=>({'@type':'Question',name:x.q,acceptedAnswer:{'@type':'Answer',text:x.a}}))};
  return <main className="seoPage">
    <header className="nav shell"><a className="brand" href="/"><span className="brandMark"><Wrench size={18}/></span><span>RepairSlot</span></a><nav><a href="/resources">Resources</a><a href="/#pricing">Pricing</a><a className="button buttonSmall" href="/book/demo">Try demo</a></nav></header>
    <section className="seoHero shell"><div className="eyebrow">Repair booking software comparison</div><h1>{page.title}</h1><p>{page.intro}</p><div className="heroActions"><a className="button" href="/book/demo">Try the RepairSlot booking flow <ArrowRight size={16}/></a><a className="ghostButton" href="/#pricing">See pricing</a></div></section>
    <section className="section shell seoTwoCol"><div><div className="eyebrow">{page.competitor} is strongest when</div><h2>You want a broader operations platform.</h2><ul className="seoChecklist">{page.competitorStrengths.map(x=><li key={x}><Check/>{x}</li>)}</ul></div><div><div className="eyebrow">RepairSlot is strongest when</div><h2>You want to improve the booking path first.</h2><ul className="seoChecklist">{page.repairSlotStrengths.map(x=><li key={x}><Check/>{x}</li>)}</ul></div></section>
    <section className="section industrySection"><div className="shell"><div className="sectionIntro narrow"><div className="eyebrow">Best fit</div><h2>{page.bestFor}</h2><p>{page.repairSlotAngle}</p></div><div className="steps"><article className="step"><span>1</span><h3>Keep your existing stack</h3><p>Use RepairSlot as the customer-facing booking layer without forcing a full CRM or field-service migration.</p></article><article className="step"><span>2</span><h3>Collect repair details first</h3><p>Ask what is broken, where the job is and what the business needs before offering an appointment window.</p></article><article className="step"><span>3</span><h3>Put booking everywhere</h3><p>Use a hosted booking page, inline website embed or floating widget.</p></article></div></div></section>
    <section className="section shell"><div className="sectionIntro narrow"><div className="eyebrow">How to evaluate both</div><h2>Test the difficult booking cases, not just the happy path.</h2><p>Before choosing software, test an out-of-area customer, a fully booked day, a service with a different duration, a reschedule, a cancellation, a deposit-required job and an after-hours visitor. The right system should make the customer experience clear without creating impossible promises for the repair team.</p><p><a href="/online-booking-for-repair-businesses">Read the online booking guide</a> · <a href="/repair-booking-widget">See the repair booking widget</a> · <a href="/google-business-profile-repair-booking-link">Google Business Profile booking</a></p></div></section>
    <section className="section shell faqSection"><div className="sectionIntro narrow"><div className="eyebrow">FAQ</div><h2>{page.competitor} vs. RepairSlot questions</h2></div><div className="faqList">{page.questions.map(x=><details key={x.q}><summary>{x.q}</summary><p>{x.a}</p></details>)}</div></section>
    <section className="section industrySection"><div className="shell"><div className="sectionIntro narrow"><div className="eyebrow">More comparisons</div><h2>Compare the booking layer before changing your whole stack.</h2></div><div className="resourceGrid">{competitorPages.filter(x=>x.slug!==page.slug).map(x=><a className="resourceCard" href={`/compare/${x.slug}`} key={x.slug}><Wrench/><div><strong>{x.title}</strong><span>{x.description}</span></div><ArrowRight/></a>)}</div></div></section>
    <section className="cta"><div className="shell ctaInner"><div><div className="eyebrow light">A narrower tool can be the right tool.</div><h2>Add repair booking without replacing everything else.</h2></div><a className="button lightButton" href="/book/demo">Try RepairSlot</a></div></section>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(faqSchema)}}/>
  </main>;
}
