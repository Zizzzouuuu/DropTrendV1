import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';

const { auth } = NextAuth(authConfig);
const intlMiddleware = createMiddleware(routing);

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // 1. Force Redirect non-localized dashboard/protected routes to default locale (fr)
  // This is critical to prevent 404s on /dashboard access
  // 1. Force Redirect removed to allow auto-detection by intlMiddleware
  // Usage of next-intl middleware will automatically handle locale negotiation

  // However, we still want to protect dashboard routes from being accessed without ANY locale?
  // next-intl does this by redirecting /dashboard to /fr/dashboard or /en/dashboard.
  // So we can remove the manual block.

  // 2. Run Intl Middleware to handle locale redirects and rewrites
  const res = intlMiddleware(req);

  // 3. Auth Logic
  const session = await auth();

  // Extract locale from path
  const locale = routing.locales.find(l => pathname.startsWith(`/${l}`)) || routing.defaultLocale;
  const pathWithoutLocale = pathname.replace(new RegExp(`^/(${routing.locales.join('|')})`), '') || '/';

  const isAuthRoute = pathWithoutLocale.startsWith('/dashboard');

  if (isAuthRoute && !session?.user) {
    const loginUrl = new URL(`/${locale}/login`, req.url);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Security Headers
  if (res) {
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('X-Frame-Options', 'DENY');
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  }

  return res;
}

export const config = {
  // Match only internationalized pathnames and protected routes
  matcher: ['/', '/(fr|en)/:path*', '/dashboard/:path*', '/login', '/pricing', '/register']
};
