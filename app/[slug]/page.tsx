import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Check, Clock3, Globe2, MessageSquareText, PhoneMissed, Wrench } from 'lucide-react';

const pages = {
  'appliance-repair-scheduling-software': {
    title: 'Appliance Repair Scheduling Software',
    keyword: 'appliance repair scheduling software',
    audience: 'appliance repair businesses',
    intro: 'Let customers book refrigerator, washer, dryer, dishwasher, oven, and freezer repairs online without waiting for a callback.',
    examples: ['Refrigerator not cooling', 'Washer leaking', 'Dryer not heating', 'Dishwasher not draining'],
  },
  'garage-door-repair-scheduling-software': {
    title: 'Garage Door Repair Scheduling Software',
    keyword: 'garage door repair scheduling software',
    audience: 'garage door repair companies',
    intro: 'Turn broken springs, opener failures, off-track doors, and repair estimates into real booked service windows.',
    examples: ['Broken spring', 'Door will not open', 'Opener not working', 'Door off track'],
  },
  'mobile-mechanic-scheduling-software': {
    title: 'Mobile Mechanic Scheduling Software',
    keyword: 'mobile mechanic scheduling software',
    audience: 'mobile mechanics',
    intro: 'Collect vehicle details, customer location, repair type, and availability before showing valid mobile service windows.',
    examples: ['Car will not start', 'Brake service', 'Battery replacement', 'Mobile diagnostic'],
  },
  'hvac-repair-scheduling-software': {
    title: 'HVAC Repair Scheduling Software',
    keyword: 'HVAC repair scheduling software',
    audience: 'HVAC repair companies',
    intro: 'Let customers schedule AC repair, heating repair, tune-ups, and service calls online, including after-hours requests.',
    examples: ['AC not cooling', 'No heat', 'System making noise', 'Seasonal tune-up'],
  },
  'plumbing-repair-scheduling-software': {
    title: 'Plumbing Repair Scheduling Software',
    keyword: 'plumbing repair scheduling software',
    audience: 'plumbing companies',
    intro: 'Book drains, leaks, toilets, water heaters, and plumbing repairs from your website without the request-and-callback loop.',
    examples: ['Clogged drain', 'Leaking pipe', 'Water heater issue', 'Toilet repair'],
  },
  'handyman-scheduling-software': {
    title: 'Handyman Scheduling Software',
    keyword: 'handyman scheduling software',
    audience: 'handyman businesses',
    intro: 'Turn mixed-duration handyman work into bookable service windows by collecting the task list before showing availability.',
    examples: ['TV mounting', 'Drywall repair', 'Faucet replacement', 'Ceiling fan install'],
  },
} as const;

type Slug = keyof typeof pages;

export function generateStaticParams() {
  return Object.keys(pages).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = pages[slug as Slug];
  if (!page) return {};
  return {
    title: `${page.title} | Online Booking for Repair Businesses`,
    description: `${page.title} from RepairSlot. Add 24/7 online booking, real service windows, missed-call recovery, reminders, and website embeds for ${page.audience}.`,
    alternates: { canonical: `/${slug}` },
    openGraph: {
      title: `${page.title} | RepairSlot`,
      description: page.intro,
      url: `https://repairslot.com/${slug}`,
    },
  };
}

export default async function IndustryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = pages[slug as Slug];
  if (!page) notFound();

  const faq = [
    {
      q: `What is ${page.keyword}?`,
      a: `It is software that lets ${page.audience} collect service details, show valid appointment windows, and let customers book repair jobs online.`,
    },
    {
      q: 'Can RepairSlot work on my existing website?',
      a: 'Yes. Use a hosted booking page, embed the full booking experience into a page on your own website, or install a floating Book a Repair widget.',
    },
    {
      q: 'Do customers have to create an account?',
      a: 'No. The booking flow is designed for customers to choose the repair, provide service details, select an available window, and confirm the booking without creating an account.',
    },
    {
      q: 'Can RepairSlot help with missed calls?',
      a: 'RepairSlot is designed to support missed-call text-back and abandoned-booking recovery so customers can return to a booking flow instead of calling another repair company.',
    },
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  return (
    <main className="seoPage">
      <header className="nav shell">
        <a className="brand" href="/"><span className="brandMark"><Wrench size={18} /></span><span>RepairSlot</span></a>
        <nav><a href="/#pricing">Pricing</a><a className="button buttonSmall" href="/book/demo">Try demo</a></nav>
      </header>

      <section className="seoHero shell">
        <div className="eyebrow">Built for {page.audience}</div>
        <h1>{page.title}</h1>
        <p>{page.intro}</p>
        <div className="heroActions">
          <a className="button" href="/book/demo">Try the live booking demo</a>
          <a className="ghostButton" href="/#pricing">See pricing</a>
        </div>
      </section>

      <section className="seoStrip">
        <div className="shell seoBenefits">
          <div><Clock3 /><strong>24/7 booking</strong><span>Take repair bookings after your phone lines close.</span></div>
          <div><PhoneMissed /><strong>Missed-call recovery</strong><span>Give missed callers a direct path to a real booking.</span></div>
          <div><Globe2 /><strong>Works on your site</strong><span>Hosted page, inline embed, or floating widget.</span></div>
          <div><MessageSquareText /><strong>Repair-specific intake</strong><span>Collect the problem before showing the calendar.</span></div>
        </div>
      </section>

      <section className="section shell seoTwoCol">
        <div>
          <div className="eyebrow">Replace the callback loop</div>
          <h2>Customers should be able to book while they are ready to hire.</h2>
          <p>Most generic appointment calendars start with a time. RepairSlot starts with the repair. That means you can collect the information your team actually needs before the customer chooses a service window.</p>
          <ul className="seoChecklist">
            <li><Check /> Ask service-specific questions first</li>
            <li><Check /> Validate service area before showing availability</li>
            <li><Check /> Offer time windows your team can actually service</li>
            <li><Check /> Send confirmations and reminders automatically</li>
            <li><Check /> Add booking without replacing your existing website</li>
          </ul>
        </div>
        <div className="seoExampleCard">
          <span>Example booking options</span>
          <h3>What needs repair?</h3>
          {page.examples.map((item) => <div className="seoExample" key={item}>{item}</div>)}
          <div className="seoWindow"><strong>Next available</strong><span>Tomorrow · 10 AM–12 PM</span></div>
        </div>
      </section>

      <section className="section industrySection">
        <div className="shell seoInstall">
          <div className="sectionIntro narrow">
            <div className="eyebrow">Install it your way</div>
            <h2>One booking flow, three ways to put it in front of customers.</h2>
          </div>
          <div className="steps">
            <article className="step"><span>1</span><h3>Hosted booking page</h3><p>Share a RepairSlot booking URL from Google Business Profile, social media, email, or text messages.</p></article>
            <article className="step"><span>2</span><h3>Inline website booking</h3><p>Put the complete booking experience directly on a page of your existing website.</p></article>
            <article className="step"><span>3</span><h3>Floating booking widget</h3><p>Add a persistent Book a Repair button that opens the booking flow without sending customers away.</p></article>
          </div>
        </div>
      </section>

      <section className="section shell faqSection">
        <div className="sectionIntro narrow"><div className="eyebrow">FAQ</div><h2>{page.title} questions</h2></div>
        <div className="faqList">{faq.map((item) => <details key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>)}</div>
      </section>

      <section className="cta"><div className="shell ctaInner"><div><div className="eyebrow light">Stop losing ready-to-book repair customers.</div><h2>Add real online booking to your repair business.</h2></div><a className="button lightButton" href="/#pricing">Start with RepairSlot</a></div></section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </main>
  );
}
