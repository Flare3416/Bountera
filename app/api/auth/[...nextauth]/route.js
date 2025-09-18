import NextAuth from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

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
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
    newUser: '/profile-setup' // Redirect new users to profile setup
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        await connectDB();
        
        // Check if user exists in database
        let existingUser = await User.findOne({ email: user.email });
        
        if (!existingUser) {
          // Generate username from email
          let username = user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
          
          // Ensure username uniqueness
          let baseUsername = username;
          let counter = 1;
          while (await User.findOne({ username })) {
            username = `${baseUsername}${counter}`;
            counter++;
          }
          
          // Create new user in database
          existingUser = await User.create({
            email: user.email,
            username: username,
            name: user.name || user.email.split('@')[0],
            avatar: user.image || '',
            role: null, // Will be set when user selects role
            profileCompleted: false,
            skills: [],
            bio: '',
            githubUsername: account?.provider === 'github' ? profile?.login : '',
            portfolioUrl: '',
            location: '',
            joinedAt: new Date(),
            lastLoginAt: new Date(),
            isActive: true
          });
          
          console.log('Created new user:', existingUser.email);
        } else {
          // Update last login
          await User.findOneAndUpdate(
            { email: user.email },
            { lastLoginAt: new Date() }
          );
        }
        
        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return true; // Allow sign in even if database operation fails
      }
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
    async session({ session, token }) {
      // Determine user role based on their actions
      try {
        let userRole = 'creator'; // Default role
        
        console.log('🔍 Role detection for user:', session.user.email);
        
        // Check if user has created any bounties to determine if they're a bounty poster
        try {
          await connectDB();
          const Bounty = (await import('@/models/Bounty')).default;
          
          // First find the user by email to get their ObjectId
          const user = await User.findOne({ email: session.user.email });
          console.log('🔍 User found in DB:', !!user, user?._id);
          
          if (user) {
            // Check if user has posted any bounties using their ObjectId
            const bountyCount = await Bounty.countDocuments({
              postedBy: user._id
            });
            
            console.log('🔍 Bounty count for user:', bountyCount);
            
            if (bountyCount > 0) {
              userRole = 'bounty_poster';
              console.log('✅ User is bounty_poster with', bountyCount, 'bounties');
            } else {
              console.log('ℹ️ User is creator (no bounties posted)');
            }
          } else {
            console.log('⚠️ User not found in database');
          }
        } catch (dbError) {
          console.log('Could not check bounty count, using default role:', dbError.message);
        }
        
        session.user.role = userRole;
        console.log('🔍 Final role assigned:', userRole);
        session.user.profileCompleted = false; // Default
        session.user.id = token.sub || null;
        
        return session;
      } catch (error) {
        console.error('Error in session callback:', error);
        return session;
      }
    },
    async jwt({ token, user, isNewUser }) {
      if (user) {
        token.isNewUser = isNewUser;
      }
      return token;
    }
  },
  // Add logger configuration to handle logging errors
  logger: {
    error(code, metadata) {
      console.error('NextAuth Error:', code, metadata);
    },
    warn(code) {
      console.warn('NextAuth Warning:', code);
    },
    debug(code, metadata) {
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.log('NextAuth Debug:', code, metadata);
      }
    }
  },
  // Disable built-in debug logging that might be causing issues
  debug: process.env.NODE_ENV === 'development'
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
