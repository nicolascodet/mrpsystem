import NextAuth from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";

// Always use production URL for auth
const PRODUCTION_URL = "https://mrpsystem.vercel.app";
const TENANT_ID = "0772737c-2e7f-49c6-a0d6-be3d35bad280";

const handler = NextAuth({
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: TENANT_ID,
      name: "Atelier Frames Account",
      authorization: {
        params: {
          redirect_uri: `${PRODUCTION_URL}/api/auth/callback/azure-ad`,
          prompt: "select_account", // Force account selection
          domain_hint: "atelierframes.com"
        }
      }
    }),
  ],
  pages: {
    signIn: "/auth/signin", // Use custom sign-in page
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
});

export { handler as GET, handler as POST };
