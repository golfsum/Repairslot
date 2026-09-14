import { NextRequest, NextResponse } from 'next/server';
import { createBillingPortalSession, retrieveCheckoutSession } from '../../../../lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const sessionId = String(form.get('session_id') || '');
    if (!sessionId.startsWith('cs_')) {
      return NextResponse.redirect(new URL('/account?billing=invalid', request.url), 303);
    }

    const checkout = await retrieveCheckoutSession(sessionId);
    const customer = typeof checkout.customer === 'string' ? checkout.customer : checkout.customer?.id;
    if (!customer) {
      return NextResponse.redirect(new URL('/account?billing=no_customer', request.url), 303);
    }

    const portal = await createBillingPortalSession(customer);
    return NextResponse.redirect(portal.url, 303);
  } catch (error) {
    console.error('RepairSlot billing portal error', error);
    return NextResponse.redirect(new URL('/account?billing=error', request.url), 303);
  }
}
