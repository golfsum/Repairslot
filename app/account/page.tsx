import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

export default function AccountPage() {
  return (
    <main className="accountPage">
      <section className="accountCard">
        <CheckCircle2 size={42} />
        <div className="eyebrow">Test checkout complete</div>
        <h1>RepairSlot subscription received.</h1>
        <p>This is the current test-mode confirmation page. When RepairSlot goes live, this page will become the customer account area for plan status, billing, and setup.</p>
        <Link className="button" href="/">Back to RepairSlot</Link>
      </section>
    </main>
  );
}
