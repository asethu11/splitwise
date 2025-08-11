import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Only apply to admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Skip middleware for login page
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next();
    }

    // Check for admin key in headers (for API routes)
    const adminKey = request.headers.get('x-admin-key');
    const devAdminKey = process.env.ADMIN_KEY || 'dev-admin-key-2024';
    
    if (adminKey === devAdminKey) {
      return NextResponse.next();
    }

    // Check for admin key in cookies (for client-side routes)
    const cookieAdminKey = request.cookies.get('adminKey')?.value;
    if (cookieAdminKey === devAdminKey) {
      return NextResponse.next();
    }

    // For non-API routes, redirect to login
    if (!request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // For API routes, return unauthorized
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
