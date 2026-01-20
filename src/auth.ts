import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { z } from 'zod';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

async function getUser(email: string) {
  const user = await db.user.findUnique({ where: { email } });
  return user;
}

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          console.log(`[Auth] Attempting login for ${email}`);
          
          const user = await getUser(email);
          if (!user) {
            console.log(`[Auth] User not found: ${email}`);
            return null;
          }
          
          if (!user.password) {
             console.log(`[Auth] User has no password (OAuth?): ${email}`);
             return null;
          }

          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) {
             console.log(`[Auth] Login successful for ${email}`);
             return user;
          } else {
             console.log(`[Auth] Invalid password for ${email}`);
          }
        } else {
            console.log("[Auth] Invalid input format");
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        const user = await db.user.findUnique({ where: { id: token.sub } });
        if (user) {
          session.user.subscription = user.subscription;
          session.user.shopifyConnected = user.shopifyConnected;
        }
      }
      return session;
    },
    async jwt({ token }) {
      return token;
    }
  }
});
