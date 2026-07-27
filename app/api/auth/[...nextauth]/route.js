import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      // No prompt=consent
      // No access_type unless you actually need refresh tokens
    }),
  ],

  pages: {
    signIn: "/login",
    newUser: "/profile-setup",
  },

  callbacks: {
    async signIn() {
      return true;
    },

    async redirect({ url, baseUrl }) {
      // Allow relative callback URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      // Allow same-origin URLs
      if (new URL(url).origin === baseUrl) {
        return url;
      }

      // Fallback
      return baseUrl;
    },

    async session({ session }) {
      return session;
    },

    async jwt({ token, user, isNewUser }) {
      if (user) {
        token.isNewUser = isNewUser;
      }

      return token;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };