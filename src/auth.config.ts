import type { NextAuthConfig } from 'next-auth';
 
export const authConfig = {
  pages: {
    signIn: '/fr/login', // Force default locale for now, middleware handles dynamic redirect
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      
      // Check if path is protected (dashboard)
      // Note: nextUrl.pathname will be fully localized here e.g., /fr/dashboard
      const isOnDashboard = nextUrl.pathname.includes('/dashboard');

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users
      } else if (isLoggedIn && nextUrl.pathname.includes('/login')) {
        // Redirect logged-in users away from login
        // Default to french dashboard if no specific locale found (simplified)
        return Response.redirect(new URL('/fr/dashboard', nextUrl));
      }
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
  trustHost: true,
  // Ensure we use the environment variable. 
  // If it's missing in production, NextAuth will throw an error, which is good.
  // In dev, we want to ensure consistency between Node and Edge runtimes.
  secret: process.env.AUTH_SECRET, 
  session: {
    strategy: "jwt",
  },
} satisfies NextAuthConfig;
