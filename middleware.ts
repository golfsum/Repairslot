import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/admin')) return NextResponse.next();

  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return new NextResponse('RepairSlot admin is not configured. Set ADMIN_PASSWORD in Vercel.', { status: 503 });
  }

  const auth = request.headers.get('authorization');
  if (auth?.startsWith('Basic ')) {
    try {
      const decoded = atob(auth.slice(6));
      const separator = decoded.indexOf(':');
      const suppliedPassword = separator >= 0 ? decoded.slice(separator + 1) : '';
      if (suppliedPassword === password) return NextResponse.next();
    } catch {}
  }

  return new NextResponse('Authentication required.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="RepairSlot Admin"' },
  });
}

export const config = { matcher: ['/admin/:path*'] };
