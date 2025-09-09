import NextAuth from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'

const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  pages: {
    signIn: '/login',
    newUser: '/profile-setup' // Redirect new users to profile setup
  },
  callbacks: {
    async signIn({ user }) {
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Handle OAuth callbacks
      if (url.includes('/api/auth/callback')) {
        return `${baseUrl}/auth-redirect`;
      }
      
      // Handle default auth URLs
      if (url === baseUrl || url === `${baseUrl}/login` || url === `${baseUrl}/`) {
        return `${baseUrl}/auth-redirect`;
      }
      
      // Handle sign out
      if (url.includes('signout')) {
        return `${baseUrl}/`;
      }
      
      return `${baseUrl}/auth-redirect`;
    },
    async session({ session }) {
      return session;
    },
    async jwt({ token, user, isNewUser }) {
      if (user) {
        token.isNewUser = isNewUser;
      }
      return token;
    }
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
