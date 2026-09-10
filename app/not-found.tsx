import type {Metadata} from 'next';

export const metadata:Metadata={
  title:{absolute:'Page Not Found | RepairSlot'},
  description:'The requested RepairSlot page could not be found.',
  robots:{index:false,follow:true},
  alternates:{canonical:null}
};

export default function NotFound(){
  return <main className="seoPage"><section className="seoHero shell"><div className="eyebrow">404</div><h1>That page could not be found.</h1><p>The address may have changed, or the page may no longer exist.</p><div className="heroActions"><a className="button" href="/">Return to RepairSlot</a><a className="ghostButton" href="/resources">Browse resources</a></div></section></main>
}
