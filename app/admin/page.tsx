import Link from 'next/link';
import { getStripeAdminSnapshot } from '../../lib/stripe';

export const dynamic = 'force-dynamic';

function money(cents?: number | null, currency = 'usd') {
  if (typeof cents !== 'number') return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100);
}

function date(value?: number | null) {
  if (!value) return '—';
  return new Date(value * 1000).toLocaleString('en-US');
}

export default async function AdminPage() {
  let snapshot: Awaited<ReturnType<typeof getStripeAdminSnapshot>>;
  let error = '';
  try {
    snapshot = await getStripeAdminSnapshot();
  } catch (e) {
    snapshot = { configured: false, customers: [], subscriptions: [], paymentLinks: [] };
    error = e instanceof Error ? e.message : 'Unable to load Stripe data';
  }

  const active = snapshot.subscriptions.filter((s: any) => ['active', 'trialing'].includes(s.status));
  const mrr = active.reduce((sum: number, sub: any) => {
    const item = sub.items?.data?.[0];
    const price = item?.price;
    if (!price?.unit_amount) return sum;
    if (price.recurring?.interval === 'year') return sum + price.unit_amount / 12;
    return sum + price.unit_amount;
  }, 0);

  return (
    <main style={{minHeight:'100vh',background:'#f6f8fb',padding:'32px 20px',fontFamily:'Arial, sans-serif',color:'#172033'}}>
      <div style={{maxWidth:1180,margin:'0 auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',gap:20,alignItems:'center',marginBottom:28}}>
          <div><div style={{fontSize:13,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:'#557'}}>RepairSlot Admin</div><h1 style={{margin:'6px 0 0',fontSize:34}}>Operations dashboard</h1></div>
          <Link href="/" style={{textDecoration:'none',color:'#172033',fontWeight:700}}>View site →</Link>
        </div>

        {!snapshot.configured && <div style={{padding:18,border:'1px solid #e6b96a',background:'#fff8e8',borderRadius:14,marginBottom:22}}><strong>Stripe server access needs configuration.</strong><div style={{marginTop:6}}>Add <code>STRIPE_SECRET_KEY</code> in Vercel. Admin authentication also uses <code>ADMIN_PASSWORD</code>.</div>{error && <div style={{marginTop:6}}>Stripe error: {error}</div>}</div>}

        <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:14,marginBottom:24}}>
          {[['Customers', snapshot.customers.length],['Active subscriptions', active.length],['MRR', money(mrr)],['Payment links', snapshot.paymentLinks.filter((p:any)=>p.active).length]].map(([label,value])=><div key={String(label)} style={{background:'#fff',border:'1px solid #e7eaf0',borderRadius:16,padding:20}}><div style={{fontSize:13,color:'#667085'}}>{label}</div><div style={{fontSize:28,fontWeight:800,marginTop:6}}>{String(value)}</div></div>)}
        </section>

        <section style={{background:'#fff',border:'1px solid #e7eaf0',borderRadius:16,padding:20,marginBottom:24,overflowX:'auto'}}>
          <h2 style={{marginTop:0}}>Subscriptions</h2>
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:760}}><thead><tr>{['Customer','Status','Plan','Amount','Started','Current period end'].map(h=><th key={h} style={{textAlign:'left',fontSize:12,color:'#667085',padding:'10px 8px',borderBottom:'1px solid #eee'}}>{h}</th>)}</tr></thead><tbody>
            {snapshot.subscriptions.map((sub:any)=>{const item=sub.items?.data?.[0]; return <tr key={sub.id}><td style={{padding:'12px 8px',borderBottom:'1px solid #f1f2f4'}}>{typeof sub.customer==='string'?sub.customer:sub.customer?.email||sub.customer?.id}</td><td style={{padding:'12px 8px',borderBottom:'1px solid #f1f2f4'}}>{sub.status}</td><td style={{padding:'12px 8px',borderBottom:'1px solid #f1f2f4'}}>{item?.price?.nickname||item?.price?.product||'—'}</td><td style={{padding:'12px 8px',borderBottom:'1px solid #f1f2f4'}}>{money(item?.price?.unit_amount,item?.price?.currency)}</td><td style={{padding:'12px 8px',borderBottom:'1px solid #f1f2f4'}}>{date(sub.start_date)}</td><td style={{padding:'12px 8px',borderBottom:'1px solid #f1f2f4'}}>{date(item?.current_period_end||sub.current_period_end)}</td></tr>})}
            {!snapshot.subscriptions.length && <tr><td colSpan={6} style={{padding:18,color:'#667085'}}>No subscriptions found.</td></tr>}
          </tbody></table>
        </section>

        <section style={{background:'#fff',border:'1px solid #e7eaf0',borderRadius:16,padding:20,marginBottom:24,overflowX:'auto'}}>
          <h2 style={{marginTop:0}}>Customers</h2>
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:700}}><thead><tr>{['Name','Email','Phone','Created','Stripe ID'].map(h=><th key={h} style={{textAlign:'left',fontSize:12,color:'#667085',padding:'10px 8px',borderBottom:'1px solid #eee'}}>{h}</th>)}</tr></thead><tbody>
            {snapshot.customers.map((c:any)=><tr key={c.id}><td style={{padding:'12px 8px',borderBottom:'1px solid #f1f2f4'}}>{c.name||'—'}</td><td style={{padding:'12px 8px',borderBottom:'1px solid #f1f2f4'}}>{c.email||'—'}</td><td style={{padding:'12px 8px',borderBottom:'1px solid #f1f2f4'}}>{c.phone||'—'}</td><td style={{padding:'12px 8px',borderBottom:'1px solid #f1f2f4'}}>{date(c.created)}</td><td style={{padding:'12px 8px',borderBottom:'1px solid #f1f2f4',fontFamily:'monospace'}}>{c.id}</td></tr>)}
            {!snapshot.customers.length && <tr><td colSpan={5} style={{padding:18,color:'#667085'}}>No customers found.</td></tr>}
          </tbody></table>
        </section>

        <section style={{background:'#fff',border:'1px solid #e7eaf0',borderRadius:16,padding:20,overflowX:'auto'}}>
          <h2 style={{marginTop:0}}>Checkout links</h2>
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:680}}><thead><tr>{['Plan','Status','URL','Created'].map(h=><th key={h} style={{textAlign:'left',fontSize:12,color:'#667085',padding:'10px 8px',borderBottom:'1px solid #eee'}}>{h}</th>)}</tr></thead><tbody>{snapshot.paymentLinks.map((p:any)=><tr key={p.id}><td style={{padding:'12px 8px',borderBottom:'1px solid #f1f2f4'}}>{p.metadata?.plan||'—'}</td><td style={{padding:'12px 8px',borderBottom:'1px solid #f1f2f4'}}>{p.active?'Active':'Inactive'}</td><td style={{padding:'12px 8px',borderBottom:'1px solid #f1f2f4'}}><a href={p.url} target="_blank" rel="noreferrer">Open Stripe link</a></td><td style={{padding:'12px 8px',borderBottom:'1px solid #f1f2f4'}}>{date(p.created)}</td></tr>)}</tbody></table>
        </section>
      </div>
    </main>
  );
}
