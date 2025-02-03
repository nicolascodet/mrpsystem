import NextAuth from "next-auth";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";

const TENANT_ID = "0772737c-2e7f-49c6-a0d6-be3d35bad280";

const handler = NextAuth({
  providers: [
    {
      id: "azure-ad",
      name: "Microsoft",
      type: "oauth",
      authorization: {
        url: `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/authorize`,
        params: { scope: "openid profile email" }
      },
      token: `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`,
      userinfo: "https://graph.microsoft.com/oidc/userinfo",
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
        }
      },
    }
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
});

export { handler as GET, handler as POST };
