import Link from 'next/link';
import { CheckCircle2, CreditCard, Wrench } from 'lucide-react';

export default async function AccountPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const checkoutSuccess = params.checkout === 'success';
  const sessionId = typeof params.session_id === 'string' ? params.session_id : '';
  const billingError = typeof params.billing === 'string' ? params.billing : '';

  return (
    <main className="accountPage">
      <section className="accountCard">
        <div className="brand" style={{marginBottom:16}}><span className="brandMark"><Wrench size={16}/></span><span>RepairSlot</span></div>
        {checkoutSuccess ? <CheckCircle2 size={42} /> : <CreditCard size={42} />}
        <div className="eyebrow">{checkoutSuccess ? 'Subscription received' : 'Customer account'}</div>
        <h1>{checkoutSuccess ? 'Welcome to RepairSlot.' : 'Manage RepairSlot billing.'}</h1>
        <p>{checkoutSuccess ? 'Your Stripe checkout completed successfully. Use the billing button below to update your payment method, view invoices, change your plan, or cancel your subscription.' : 'Open your secure Stripe billing portal from the checkout confirmation link you received after subscribing.'}</p>

        {billingError && <p style={{color:'#a33'}}><strong>Billing portal could not be opened.</strong> Please use the original checkout confirmation link or contact support.</p>}

        {sessionId && <form action="/api/billing/portal" method="post" style={{width:'100%'}}><input type="hidden" name="session_id" value={sessionId}/><button className="button full" type="submit">Manage billing</button></form>}
        {!sessionId && <p style={{fontSize:14}}>For security, billing access is tied to your Stripe checkout session. If you just subscribed, return using the checkout confirmation link.</p>}
        <Link className="ghostButton full" href="/">Back to RepairSlot</Link>
      </section>
    </main>
  );
}
