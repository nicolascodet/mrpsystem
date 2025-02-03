import NextAuth from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";

const handler = NextAuth({
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: "0772737c-2e7f-49c6-a0d6-be3d35bad280",
    }),
  ],
});

export { handler as GET, handler as POST };
