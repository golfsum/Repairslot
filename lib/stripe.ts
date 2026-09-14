const STRIPE_API = 'https://api.stripe.com/v1';

export function stripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

async function stripeRequest(path: string, init: RequestInit = {}) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured');

  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${key}`);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/x-www-form-urlencoded');
  }

  const response = await fetch(`${STRIPE_API}${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body?.error?.message || `Stripe request failed (${response.status})`);
  }
  return body;
}

export async function getStripeAdminSnapshot() {
  if (!stripeConfigured()) {
    return { configured: false as const, customers: [], subscriptions: [], paymentLinks: [] };
  }

  const [customers, subscriptions, paymentLinks] = await Promise.all([
    stripeRequest('/customers?limit=20'),
    stripeRequest('/subscriptions?status=all&limit=20'),
    stripeRequest('/payment_links?limit=20'),
  ]);

  return {
    configured: true as const,
    customers: customers.data || [],
    subscriptions: subscriptions.data || [],
    paymentLinks: paymentLinks.data || [],
  };
}

export async function retrieveCheckoutSession(sessionId: string) {
  return stripeRequest(`/checkout/sessions/${encodeURIComponent(sessionId)}`);
}

export async function createBillingPortalSession(customerId: string) {
  const body = new URLSearchParams({
    customer: customerId,
    return_url: 'https://repairslot.com/account',
  });
  return stripeRequest('/billing_portal/sessions', {
    method: 'POST',
    body,
  });
}
