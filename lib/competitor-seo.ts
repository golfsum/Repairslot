export type CompetitorPage = {
  slug:string;
  competitor:string;
  title:string;
  description:string;
  intro:string;
  bestFor:string;
  repairSlotAngle:string;
  competitorStrengths:string[];
  repairSlotStrengths:string[];
  questions:{q:string;a:string}[];
};

export const competitorPages: CompetitorPage[] = [
  {
    slug:'jobber-alternative-for-online-booking',
    competitor:'Jobber',
    title:'Jobber Alternative for Repair Business Online Booking',
    description:'Compare Jobber with RepairSlot if your main goal is adding repair-specific online booking to an existing website without replacing your full business software stack.',
    intro:'Jobber is a broad field-service platform with scheduling, CRM, invoicing, routing, marketing and online booking. RepairSlot takes a narrower approach: add a customer-facing repair booking layer to the website and tools you already use.',
    bestFor:'Repair businesses comparing a full field-service platform with a lighter online-booking layer.',
    repairSlotAngle:'Choose RepairSlot when the immediate problem is turning website visitors, missed calls and after-hours demand into booked repair jobs without migrating the entire operation.',
    competitorStrengths:['Full field-service workflow','CRM, quotes and invoicing','Scheduling and routing','Online booking and Google Business Profile booking','Marketing and website tools'],
    repairSlotStrengths:['Repair-first intake before showing times','Hosted page, inline embed and floating widget','Designed to work alongside existing software','Missed-call and abandoned-booking recovery focus','Simpler customer-facing booking layer'],
    questions:[
      {q:'Is RepairSlot a full Jobber replacement?',a:'No. RepairSlot is intentionally focused on customer-facing repair intake, online booking and lead recovery. A business can keep Jobber or another back-office system and use RepairSlot as the booking layer.'},
      {q:'Which is better if I need invoicing, quoting and dispatch?',a:'A broad field-service platform such as Jobber is the better fit when you want those operations in one system. RepairSlot is aimed at businesses whose main need is adding a better online booking experience.'},
      {q:'Can I add RepairSlot to my existing repair website?',a:'Yes. RepairSlot supports a hosted booking page, inline website embed and floating booking widget.'}
    ]
  },
  {
    slug:'housecall-pro-alternative-for-online-booking',
    competitor:'Housecall Pro',
    title:'Housecall Pro Alternative for Repair Business Online Booking',
    description:'Compare Housecall Pro and RepairSlot for online repair booking, website booking widgets, service-area intake and customer self-scheduling.',
    intro:'Housecall Pro combines scheduling, dispatch, estimates, payments, websites and online booking. RepairSlot focuses on the moment before a job reaches the back office: helping a repair customer describe the problem and choose a valid service window.',
    bestFor:'Repair companies that already have operational software but want a focused booking and conversion layer.',
    repairSlotAngle:'RepairSlot is built for businesses that do not want to replace their CRM, dispatch or invoicing platform just to add online booking.',
    competitorStrengths:['Scheduling and dispatch','Online booking from website or Google','Payments and estimates','Customer portal','Route and technician management'],
    repairSlotStrengths:['Repair-specific guided intake','Website-first booking widget','Existing-stack friendly','Service-area checks before availability','After-hours and missed-demand recovery'],
    questions:[
      {q:'Does RepairSlot replace Housecall Pro?',a:'Not as a full operations platform. RepairSlot is a narrower booking product for repair businesses that want a better customer-facing booking experience.'},
      {q:'Can RepairSlot work if I already use field-service software?',a:'Yes. That is a core use case: keep the operational system and add RepairSlot as the customer-facing booking layer.'},
      {q:'What should I compare in an online booking demo?',a:'Test service-area rules, repair-specific intake, real availability, fully booked days, rescheduling, deposits and what happens when the requested service cannot be booked.'}
    ]
  },
  {
    slug:'workiz-alternative-for-online-booking',
    competitor:'Workiz',
    title:'Workiz Alternative for Repair Business Online Booking',
    description:'Compare Workiz and RepairSlot for 24/7 repair booking, deposits, booking rules, website embeds and lead conversion.',
    intro:'Workiz offers full field-service management and a strong online booking feature with real-time availability, deposits and booking rules. RepairSlot narrows the experience around repair intake and website conversion.',
    bestFor:'Small repair businesses that want online booking first and a lighter implementation.',
    repairSlotAngle:'RepairSlot makes online repair booking the product rather than one feature inside a larger operations suite.',
    competitorStrengths:['Full field-service suite','Real-time calendar booking','Deposits during booking','Scheduling rules and availability controls','Website and Google booking'],
    repairSlotStrengths:['Repair-focused guided flow','Fast website installation','Hosted, inline and floating widget options','Works without a full software migration','Lead recovery and conversion positioning'],
    questions:[
      {q:'What is the main difference between Workiz and RepairSlot?',a:'Workiz is a broad field-service platform. RepairSlot is focused on customer intake, online repair booking and recovering high-intent demand.'},
      {q:'Can RepairSlot take deposits?',a:'RepairSlot is designed to support deposit collection for services where a business wants commitment before reserving time or parts.'},
      {q:'Can customers book after hours?',a:'Yes. The hosted page and website booking options are designed to remain available 24/7 while still respecting business-defined availability.'}
    ]
  },
  {
    slug:'simplybook-me-alternative-for-repair-businesses',
    competitor:'SimplyBook.me',
    title:'SimplyBook.me Alternative for Repair Businesses',
    description:'Compare a general appointment booking widget with RepairSlot, a repair-specific booking flow built around job details, service areas and technician availability.',
    intro:'SimplyBook.me is a flexible general-purpose appointment platform with website widgets, staff calendars, payments and reminders. RepairSlot is specialized around repair jobs rather than generic appointments.',
    bestFor:'Repair companies deciding between a generic appointment scheduler and a repair-specific booking workflow.',
    repairSlotAngle:'Use RepairSlot when the booking needs to understand what is broken, where the customer is located and how long the service may take before showing a time.',
    competitorStrengths:['General-purpose booking widgets','Team calendars','Payments and reminders','Many custom booking features','Works across many service industries'],
    repairSlotStrengths:['Repair-specific intake','Service-area-first workflow','Different durations by repair type','Technician-aware service windows','Missed-call and abandoned-booking recovery'],
    questions:[
      {q:'Why not use a generic appointment scheduler for repairs?',a:'Generic schedulers work well when appointments are interchangeable. Repair jobs often vary by symptom, equipment, location, duration and technician skill, which can make a repair-specific intake flow more useful.'},
      {q:'Does RepairSlot still provide a booking widget?',a:'Yes. The booking engine can be offered through a floating widget, an inline page or a hosted booking link.'},
      {q:'Do customers need an account?',a:'No. The intended flow lets a customer describe the repair, provide location details and select an allowed service window without creating an account.'}
    ]
  }
];

export const competitorSlugs=competitorPages.map(x=>x.slug);
