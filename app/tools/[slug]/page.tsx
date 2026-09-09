import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {Wrench} from 'lucide-react';
import Calculator from './Calculator';
import {tools} from '../../../lib/tool-library';

const formulaKey=(slug:string)=>({
 'booking-conversion-calculator':'booking','after-hours-revenue-calculator':'afterhours','technician-capacity-calculator':'techcapacity','service-window-capacity-calculator':'windowcapacity','average-job-value-calculator':'avgjob','no-show-cost-calculator':'noshow','lead-response-time-cost-calculator':'leadresponse','booking-abandonment-calculator':'abandonment','repair-marketing-roi-calculator':'marketingroi'
} as Record<string,string>)[slug]||'';

export function generateStaticParams(){return tools.map(x=>({slug:x.slug}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const tool=tools.find(x=>x.slug===slug);if(!tool)return{};return{title:{absolute:`${tool.title} | RepairSlot`},description:tool.description,alternates:{canonical:`/tools/${slug}`},openGraph:{title:tool.title,description:tool.description,url:`https://repairslot.com/tools/${slug}`}}}

export default async function ToolPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const tool=tools.find(x=>x.slug===slug);if(!tool)notFound();
 return <main className="seoPage">
  <header className="nav shell"><a className="brand" href="/"><span className="brandMark"><Wrench size={18}/></span><span>RepairSlot</span></a><nav><a href="/resources">Resources</a><a href="/#pricing">Pricing</a><a className="button buttonSmall" href="/book/demo">Try demo</a></nav></header>
  <section className="seoHero shell"><div className="eyebrow">Free repair business calculator</div><h1>{tool.title}</h1><p>{tool.intro}</p></section>
  <section className="shell calcSection"><Calculator labels={tool.labels} defaults={tool.defaults} resultLabel={tool.resultLabel} formulaKey={formulaKey(slug)} explain={tool.explain}/></section>
  <section className="section shell"><div className="sectionIntro"><div className="eyebrow">Use the number</div><h2>Turn the estimate into an operational decision.</h2><p>{tool.explain} The calculator is a planning aid, not an accounting forecast. Use your own call, booking and revenue data whenever possible.</p></div><div className="steps"><article className="step"><span>1</span><h3>Use real inputs</h3><p>Pull numbers from call logs, booked jobs, website analytics or monthly revenue.</p></article><article className="step"><span>2</span><h3>Find the bottleneck</h3><p>Decide whether the larger problem is demand, booking conversion, capacity or follow-up.</p></article><article className="step"><span>3</span><h3>Test the booking flow</h3><p>RepairSlot focuses on reducing friction between service need and a confirmed appointment.</p></article></div></section>
  <section className="cta"><div className="shell ctaInner"><div><div className="eyebrow light">Make more repair demand bookable.</div><h2>Try the RepairSlot customer experience.</h2></div><a className="button lightButton" href="/book/demo">Try live demo</a></div></section>
 </main>
}