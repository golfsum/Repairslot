import { Check, Clock3, MapPin, Phone, ShieldCheck, Star, Wrench } from 'lucide-react';

export const metadata = {
  title: 'Live Embedded Booking Demo | RepairSlot',
  description: 'See a live RepairSlot booking form embedded directly inside a repair business website page.',
};

export default function EmbedDemoPage() {
  const embedCode = '<iframe src="https://repairslot.com/book/demo?embed=1" width="100%" height="620" style="border:0;border-radius:16px" loading="lazy" title="Book a repair"></iframe>';

  return (
    <main className="embedDemoPage">
      <div className="embedDemoNotice">
        <div className="embedDemoNoticeInner">
          <a href="/" className="brand"><span className="brandMark"><Wrench size={16}/></span><span>RepairSlot</span></a>
          <span>This is a live example of RepairSlot embedded inside a customer's website.</span>
          <a href="/book/demo">Open standalone booking page</a>
        </div>
      </div>

      <div className="clientSite">
        <header className="clientHeader">
          <div className="clientShell clientNav">
            <div className="clientBrand">
              <span className="clientLogo"><Wrench size={22}/></span>
              <div><strong>Desert Fix</strong><small>Appliance Repair</small></div>
            </div>
            <nav>
              <a href="#services">Services</a>
              <a href="#reviews">Reviews</a>
              <a href="#book">Book Online</a>
            </nav>
            <a className="clientPhone" href="#book"><Phone size={16}/> (520) 555-0148</a>
          </div>
        </header>

        <section className="clientHero">
          <div className="clientShell clientHeroGrid">
            <div>
              <div className="clientEyebrow"><Star size={14} fill="currentColor"/> 4.9 local rating · Same-week appointments</div>
              <h1>Appliance repair without the callback loop.</h1>
              <p>Choose what needs repair, enter your address, and reserve an available service window online.</p>
              <div className="clientProof">
                <span><ShieldCheck size={17}/> Licensed & insured</span>
                <span><Clock3 size={17}/> Real service windows</span>
                <span><MapPin size={17}/> Tucson service area</span>
              </div>
              <a className="clientCta" href="#book">Book a repair</a>
            </div>
            <div className="clientHeroCard">
              <strong>Common repairs</strong>
              <ul>
                <li><Check size={16}/> Refrigerator not cooling</li>
                <li><Check size={16}/> Washer leaking</li>
                <li><Check size={16}/> Dryer not heating</li>
                <li><Check size={16}/> Dishwasher not draining</li>
              </ul>
              <small>No phone tag. Pick a service window online.</small>
            </div>
          </div>
        </section>

        <section className="clientServices" id="services">
          <div className="clientShell">
            <div className="clientSectionTitle"><span>Local appliance repair</span><h2>Tell us what is broken. We’ll show you when we can come.</h2></div>
            <div className="clientServiceGrid">
              {['Refrigerators','Washers','Dryers','Dishwashers'].map(x => <div key={x}><Wrench size={18}/><strong>{x}</strong><p>Diagnosis and repair for common residential issues.</p></div>)}
            </div>
          </div>
        </section>

        <section className="clientBookingSection" id="book">
          <div className="clientShell clientBookingGrid">
            <div className="clientBookingCopy">
              <span className="clientSectionKicker">Book online</span>
              <h2>Reserve your repair visit.</h2>
              <p>This entire booking form is being served by RepairSlot inside the business website. Try it. The demo does not create a real appointment.</p>
              <div className="clientBookingNote"><ShieldCheck size={18}/><span>The business can change services, availability and hours in RepairSlot without editing this page again.</span></div>
            </div>
            <div className="clientEmbedWrap">
              <iframe title="Live RepairSlot embedded booking form" src="/book/demo?embed=1" loading="eager" />
            </div>
          </div>
        </section>

        <section className="clientReviews" id="reviews">
          <div className="clientShell clientReviewGrid">
            <blockquote>“Easy to schedule and I knew my service window immediately.”<span>Sample customer review</span></blockquote>
            <blockquote>“Booked after work without having to wait for a callback.”<span>Sample customer review</span></blockquote>
          </div>
        </section>
      </div>

      <section className="embedCodeSection">
        <div className="shell embedCodeGrid">
          <div>
            <div className="eyebrow">What the business installs</div>
            <h2>One iframe. Their website keeps its own design.</h2>
            <p>The company creates a Book Online page and pastes this code into an HTML/embed block. RepairSlot supplies everything inside the frame.</p>
          </div>
          <pre>{embedCode}</pre>
        </div>
      </section>
    </main>
  );
}
