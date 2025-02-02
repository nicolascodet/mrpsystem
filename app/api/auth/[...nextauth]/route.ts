import NextAuth from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { NextApiRequest, NextApiResponse } from "next";

// For Azure AD's redirect URI
const VERCEL_URL = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}`
  : process.env.NEXTAUTH_URL || "http://localhost:3000";

const handler = NextAuth({
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID,
      authorization: {
        params: {
          redirect_uri: `${VERCEL_URL}/api/auth/callback/azure-ad`
        }
      }
    }),
  ],
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
  pages: {
    signIn: '/api/auth/signin',
    signOut: '/api/auth/signout',
    error: '/api/auth/error', // Error code passed in query string as ?error=
    verifyRequest: '/api/auth/verify-request', // (used for check email message)
    newUser: '/api/auth/new-user', // New users will be directed here on first sign in (leave the property out if not of interest)
  }
});

export default handler;

export { handler as GET, handler as POST };
