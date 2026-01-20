import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      subscription?: string
      shopifyConnected?: boolean
    } & DefaultSession["user"]
  }
}
