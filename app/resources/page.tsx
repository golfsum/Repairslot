import type {Metadata} from 'next';
import {Wrench,Calculator as CalcIcon,BookOpen,ArrowRight} from 'lucide-react';
import {industries,resourcePages} from '../../lib/seo-library';
import {tools} from '../../lib/tool-library';

export const metadata:Metadata={title:{absolute:'Repair Business Booking & Scheduling Resources | RepairSlot'},description:'RepairSlot resources for repair business scheduling, online booking, missed-call recovery, website conversion, service windows and repair-business calculators.',alternates:{canonical:'/resources'}};
const group=(kind:string)=>resourcePages.filter(x=>x.kind===kind);
const featuredResources=[
 {name:'Repair Scheduling Software',url:'https://repairslot.com/repair-scheduling-software'},
 {name:'Repair Booking Software',url:'https://repairslot.com/repair-booking-software'},
 {name:'Appliance Repair Scheduling Software: Checklist & Demo',url:'https://repairslot.com/appliance-repair-scheduling-software'},
 {name:'How to Add Online Booking to a Repair Website',url:'https://repairslot.com/how-to-add-online-booking-to-repair-website'},
 {name:'Missed Call Revenue Calculator',url:'https://repairslot.com/tools/missed-call-revenue-calculator'},
];
const collectionSchema={
 '@context':'https://schema.org',
 '@type':'CollectionPage',
 name:'Repair Business Booking and Scheduling Resources',
 description:'Guides, industry checklists, comparisons and calculators for repair-business scheduling and online booking.',
 url:'https://repairslot.com/resources',
 isPartOf:{'@type':'WebSite',name:'RepairSlot',url:'https://repairslot.com'},
 mainEntity:{'@type':'ItemList',itemListElement:featuredResources.map((item,index)=>({'@type':'ListItem',position:index+1,name:item.name,url:item.url}))},
};

export default function Resources(){
 return <main className="seoPage">
  <header className="nav shell"><a className="brand" href="/"><span className="brandMark"><Wrench size={18}/></span><span>RepairSlot</span></a><nav><a href="/#pricing">Pricing</a><a className="button buttonSmall" href="/book/demo">Try demo</a></nav></header>
  <section className="seoHero shell"><div className="eyebrow">RepairSlot resource library</div><h1>Repair business booking, scheduling and conversion resources</h1><p>Browse repair-industry pages, practical booking guides, customer-conversion features, workflow comparisons and free calculators.</p></section>
  <section className="section shell"><div className="sectionIntro narrow"><div className="eyebrow">Repair industries</div><h2>Booking workflows by repair type</h2></div><div className="resourceGrid">{industries.map(x=><a href={`/${x.slug}`} className="resourceCard" key={x.slug}><Wrench/><div><strong>{x.name}</strong><span>{x.audience}</span></div><ArrowRight/></a>)}</div></section>
  <section className="section industrySection"><div className="shell"><div className="sectionIntro narrow"><div className="eyebrow">Commercial intent</div><h2>Repair booking software pages</h2></div><div className="resourceGrid">{[{slug:'repair-scheduling-software',title:'Repair Scheduling Software'},{slug:'repair-booking-software',title:'Repair Booking Software'},...group('commercial')].map((x:any)=><a href={`/${x.slug}`} className="resourceCard" key={x.slug}><BookOpen/><div><strong>{x.title}</strong><span>Buyer-focused scheduling and booking information</span></div><ArrowRight/></a>)}</div></div></section>
  <section className="section shell"><div className="sectionIntro narrow"><div className="eyebrow">Features and problems</div><h2>Fix booking friction</h2></div><div className="resourceGrid">{group('feature').map(x=><a href={`/${x.slug}`} className="resourceCard" key={x.slug}><BookOpen/><div><strong>{x.title}</strong><span>{x.intro}</span></div><ArrowRight/></a>)}</div></section>
  <section className="section industrySection"><div className="shell"><div className="sectionIntro narrow"><div className="eyebrow">Guides</div><h2>Practical repair-business playbooks</h2></div><div className="resourceGrid">{group('guide').map(x=><a href={`/${x.slug}`} className="resourceCard" key={x.slug}><BookOpen/><div><strong>{x.title}</strong><span>{x.intro}</span></div><ArrowRight/></a>)}</div></div></section>
  <section className="section shell"><div className="sectionIntro narrow"><div className="eyebrow">Decision pages</div><h2>Compare booking approaches</h2></div><div className="resourceGrid">{group('comparison').map(x=><a href={`/${x.slug}`} className="resourceCard" key={x.slug}><BookOpen/><div><strong>{x.title}</strong><span>{x.intro}</span></div><ArrowRight/></a>)}</div></section>
  <section className="section industrySection"><div className="shell"><div className="sectionIntro narrow"><div className="eyebrow">Free calculators</div><h2>Put numbers behind the booking problem</h2></div><div className="resourceGrid"><a href="/tools/missed-call-revenue-calculator" className="resourceCard"><CalcIcon/><div><strong>Missed Call Revenue Calculator</strong><span>Estimate monthly repair revenue represented by missed calls.</span></div><ArrowRight/></a>{tools.map(x=><a href={`/tools/${x.slug}`} className="resourceCard" key={x.slug}><CalcIcon/><div><strong>{x.title}</strong><span>{x.description}</span></div><ArrowRight/></a>)}</div></div></section>
  <section className="cta"><div className="shell ctaInner"><div><div className="eyebrow light">Ready to see the product?</div><h2>Try the customer booking flow.</h2></div><a className="button lightButton" href="/book/demo">Open live demo</a></div></section>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(collectionSchema)}}/>
 </main>
}
