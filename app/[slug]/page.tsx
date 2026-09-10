import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Check, Clock3, Globe2, MessageSquareText, PhoneMissed, Wrench } from 'lucide-react';
import { industries, resourcePages, allTopLevelSlugs } from '../../lib/seo-library';
import {tools} from '../../lib/tool-library';

export function generateStaticParams(){ return allTopLevelSlugs.map(slug=>({slug})); }

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params;
  const industry=industries.find(x=>x.slug===slug);
  if(industry){
    return {title:{absolute:`${industry.name} | RepairSlot`},description:`${industry.name} for ${industry.audience}. ${industry.intro}`,alternates:{canonical:`/${slug}`},openGraph:{title:`${industry.name} | RepairSlot`,description:industry.intro,url:`https://repairslot.com/${slug}`}};
  }
  const page=resourcePages.find(x=>x.slug===slug);
  if(page){
    return {title:{absolute:`${page.title} | RepairSlot`},description:page.description,alternates:{canonical:`/${slug}`},openGraph:{title:`${page.title} | RepairSlot`,description:page.intro,url:`https://repairslot.com/${slug}`}};
  }
  notFound();
}

function Header(){return <header className="nav shell"><a className="brand" href="/"><span className="brandMark"><Wrench size={18}/></span><span>RepairSlot</span></a><nav><a href="/resources">Resources</a><a href="/#pricing">Pricing</a><a className="button buttonSmall" href="/book/demo">Try demo</a></nav></header>}

function Related({current}:{current:string}){
  const stop=new Set(['repair','repairs','business','businesses','software','booking','scheduling','service','services','online','for','how','to','vs']);
  const words=(value:string)=>new Set(value.toLowerCase().split(/[^a-z0-9]+/).filter(x=>x.length>2&&!stop.has(x)));
  const currentTitle=industries.find(x=>x.slug===current)?.name||resourcePages.find(x=>x.slug===current)?.title||current;
  const currentWords=words(`${current} ${currentTitle}`);
  const pool=[
    ...industries.map(x=>({path:`/${x.slug}`,title:x.name,kind:'industry'})),
    ...resourcePages.map(x=>({path:`/${x.slug}`,title:x.title,kind:x.kind})),
    ...tools.map(x=>({path:`/tools/${x.slug}`,title:x.title,kind:'tool'}))
  ].filter(x=>x.path!==`/${current}`);
  const seed=[...current].reduce((sum,char)=>sum+char.charCodeAt(0),0);
  const related=pool.map((x,index)=>({...x,index,score:[...words(`${x.path} ${x.title}`)].filter(word=>currentWords.has(word)).length*100+((index+seed)%pool.length)})).sort((a,b)=>b.score-a.score).slice(0,6);
  return <section className="section shell"><div className="sectionIntro narrow"><div className="eyebrow">Related RepairSlot resources</div><h2>Keep improving the booking path.</h2></div><div className="industryGrid">{related.map(x=><a className="industry" href={x.path} key={x.path}><Wrench size={17}/><span>{x.title}</span></a>)}</div><p><a href="/resources">Browse all repair business resources and calculators</a></p></section>
}

export default async function SeoPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const industry=industries.find(x=>x.slug===slug);
  if(industry) return <IndustryPage slug={slug} industry={industry}/>;
  const page=resourcePages.find(x=>x.slug===slug);
  if(page) return <ResourcePageView slug={slug} page={page}/>;
  notFound();
}

function IndustryPage({slug,industry}:{slug:string;industry:(typeof industries)[number]}){
  const isAppliance=slug==='appliance-repair-scheduling-software';
  const faq=isAppliance?[
    {q:'Does the RepairSlot demo book a real technician?',a:'No. The current demo uses sample information and does not reserve a technician appointment.'},
    {q:'What should appliance repair intake collect?',a:'Start with appliance type, brand and model when known, the observed symptom, service address, access notes and contact details.'},
    {q:'How should a booking confirmation differ from a request?',a:'Say an appointment is confirmed only after the production system has checked the constraints required by the business. Otherwise acknowledge the request and explain the next step.'},
    {q:'What should I verify before choosing scheduling software?',a:'Ask a vendor to demonstrate real service-area, availability, capacity, rescheduling and confirmation behavior using your business rules.'}
  ]:[
    {q:`What is ${industry.name.toLowerCase()}?`,a:`It is customer-facing scheduling software designed to help ${industry.audience} collect job details, show valid service windows and turn repair inquiries into confirmed bookings.`},
    {q:'Can RepairSlot work on my existing website?',a:'Yes. Use a hosted booking page, embed the booking experience into your own site, or install a floating Book a Repair widget.'},
    {q:'Do customers need to create an account?',a:'No. Customers can provide repair details, choose a valid service window and confirm without creating an account.'},
    {q:'Can I control what appointments customers see?',a:'Yes. RepairSlot is designed around business-defined services, service areas, durations and availability rather than exposing an unrestricted calendar.'}
  ];
  const faqSchema={'@context':'https://schema.org','@type':'FAQPage',mainEntity:faq.map(x=>({'@type':'Question',name:x.q,acceptedAnswer:{'@type':'Answer',text:x.a}}))};
  return <main className="seoPage"><Header/>
    <section className="seoHero shell"><div className="eyebrow">Built for {industry.audience}</div><h1>{industry.name}</h1><p>{isAppliance?'A calendar slot is only useful if the team can do the job at that address, with the right preparation and enough time. Use this page to evaluate the intake and availability workflow before choosing software.':industry.intro}</p><div className="heroActions"><a className="button" href="/book/demo">{isAppliance?'Explore the sample booking demo':'Try the live booking demo'}</a><a className="ghostButton" href="/#pricing">See pricing</a></div>{isAppliance?<p><strong>Demo note:</strong> The current flow uses sample data and does not reserve a technician appointment.</p>:null}</section>
    <section className="seoStrip"><div className="shell seoBenefits"><div><Clock3/><strong>24/7 booking</strong><span>Take bookings after the office closes.</span></div><div><PhoneMissed/><strong>Recover missed demand</strong><span>Give callers and website visitors a path back to booking.</span></div><div><Globe2/><strong>Works on your site</strong><span>Hosted page, inline embed or floating widget.</span></div><div><MessageSquareText/><strong>Repair-specific intake</strong><span>Collect useful details before showing the calendar.</span></div></div></section>
    <section className="section shell seoTwoCol"><div><div className="eyebrow">Why generic calendars fall short</div><h2>The booking should understand the repair before it offers a time.</h2><p>{industry.audience.charAt(0).toUpperCase()+industry.audience.slice(1)} need more than an empty appointment slot. The service type, location, expected duration and technician capacity all affect what can actually be booked.</p>{isAppliance?<p>A production flow should test an out-of-area address, an unsupported service, a fully booked day, competing requests for the last capacity, cancellation and rescheduling. A polished demo is not proof that those cases work.</p>:null}<ul className="seoChecklist">{industry.challenges.map(x=><li key={x}><Check/>{x}</li>)}</ul><h3 className="seoSubhead">Useful intake to collect first</h3><ul className="seoChecklist">{industry.questions.map(x=><li key={x}><Check/>{x}</li>)}</ul></div><div className="seoExampleCard"><span>{isAppliance?'Sample intake options':'Example booking options'}</span><h3>What needs service?</h3>{industry.examples.map(x=><div className="seoExample" key={x}>{x}</div>)}<div className="seoWindow"><strong>{isAppliance?'Demo availability':'Next available'}</strong><span>Tomorrow · 10 AM–12 PM</span></div></div></section>
    <section className="section industrySection"><div className="shell seoInstall"><div className="sectionIntro narrow"><div className="eyebrow">Install it your way</div><h2>One booking flow, three ways to put it in front of customers.</h2></div><div className="steps"><article className="step"><span>1</span><h3>Hosted booking page</h3><p>Share a RepairSlot URL from Google Business Profile, social, email or text.</p></article><article className="step"><span>2</span><h3>Inline website booking</h3><p>Put the full flow directly on a page of the existing business website.</p></article><article className="step"><span>3</span><h3>Floating booking widget</h3><p>Add a persistent booking button without rebuilding the website.</p></article></div></div></section>
    <section className="section shell faqSection"><div className="sectionIntro narrow"><div className="eyebrow">FAQ</div><h2>{industry.name} questions</h2></div><div className="faqList">{faq.map(x=><details key={x.q}><summary>{x.q}</summary><p>{x.a}</p></details>)}</div></section>
    <Related current={slug}/><section className="cta"><div className="shell ctaInner"><div><div className="eyebrow light">Stop losing ready-to-book repair customers.</div><h2>Add real online booking to your repair business.</h2></div><a className="button lightButton" href="/#pricing">Start with RepairSlot</a></div></section><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(faqSchema)}}/></main>
}

function ResourcePageView({slug,page}:{slug:string;page:(typeof resourcePages)[number]}){
  const faq=page.faq.map((q,i)=>({q,a:i===0?`${page.title} helps a repair business reduce customer friction by giving people a clearer path from service need to a valid booking.`:i===1?'Yes. RepairSlot can be used as a hosted page, inline embed or floating widget on an existing website.':'A small repair business can start with a simple service list and availability rules, then add automation as needed.'}));
  const faqSchema={'@context':'https://schema.org','@type':'FAQPage',mainEntity:faq.map(x=>({'@type':'Question',name:x.q,acceptedAnswer:{'@type':'Answer',text:x.a}}))};
  return <main className="seoPage"><Header/>
    <section className="seoHero shell"><div className="eyebrow">{page.eyebrow}</div><h1>{page.title}</h1><p>{page.intro}</p><div className="heroActions"><a className="button" href="/book/demo">Try the booking demo</a><a className="ghostButton" href="/resources">Browse resources</a></div></section>
    <section className="section shell seoTwoCol"><div><div className="eyebrow">What to focus on</div><h2>Reduce friction between “I need this fixed” and “you’re booked.”</h2><p>Repair customers often arrive with high intent. A strong booking workflow keeps the next step obvious while still protecting the business from impossible appointment promises.</p><ul className="seoChecklist">{page.points.map(x=><li key={x}><Check/>{x}</li>)}</ul></div><div className="seoExampleCard"><span>RepairSlot approach</span><h3>Customer journey</h3><div className="seoExample">1. Choose the repair or service</div><div className="seoExample">2. Provide job and location details</div><div className="seoExample">3. See valid service windows</div><div className="seoExample">4. Confirm the booking</div><div className="seoWindow"><strong>Goal</strong><span>Less waiting, fewer lost leads</span></div></div></section>
    <section className="section industrySection"><div className="shell"><div className="sectionIntro narrow"><div className="eyebrow">Built for real repair workflows</div><h2>Use the booking layer without replacing everything else.</h2><p>RepairSlot is positioned as the customer-facing booking and recovery layer. A business can keep its current CRM, invoicing or dispatch tools and start with online booking first.</p></div><div className="steps"><article className="step"><span>1</span><h3>Start simple</h3><p>Define common services, business hours and service areas.</p></article><article className="step"><span>2</span><h3>Put booking everywhere</h3><p>Use the hosted link, inline page and floating widget.</p></article><article className="step"><span>3</span><h3>Recover more demand</h3><p>Add missed-call, reminder and abandoned-booking automation.</p></article></div></div></section>
    <section className="section shell faqSection"><div className="sectionIntro narrow"><div className="eyebrow">FAQ</div><h2>Questions about {page.title.toLowerCase()}</h2></div><div className="faqList">{faq.map(x=><details key={x.q}><summary>{x.q}</summary><p>{x.a}</p></details>)}</div></section>
    <Related current={slug}/><section className="cta"><div className="shell ctaInner"><div><div className="eyebrow light">Make the next step bookable.</div><h2>Turn more repair demand into scheduled work.</h2></div><a className="button lightButton" href="/book/demo">Try RepairSlot</a></div></section><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(faqSchema)}}/></main>
}
