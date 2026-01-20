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
  if (
      !pathname.startsWith('/fr') && 
      !pathname.startsWith('/en') && 
      !pathname.startsWith('/api') && 
      !pathname.startsWith('/_next') && 
      !pathname.includes('.')
  ) {
      // Force 'fr' for root paths like /dashboard, /pricing etc if they don't match
      const locale = routing.defaultLocale;
      return NextResponse.redirect(new URL(`/${locale}${pathname}`, req.url));
  }

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

  return res;
}

export const config = {
  // Match only internationalized pathnames and protected routes
  matcher: ['/', '/(fr|en)/:path*', '/dashboard/:path*', '/login', '/pricing', '/register']
};
