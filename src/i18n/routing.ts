import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';
 
export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'fr'],
 
  // Used when no locale matches
  defaultLocale: 'fr'
});
 
// Lightweight wrappers around Next.js' navigation APIs
// that will handle the locale prefix
export const {Link, redirect, usePathname, useRouter} =
  createNavigation(routing);
