# 🌸 Bountera - Where Talent Meets Opportunity

A modern full-stack freelance bounty platform connecting bounty hunters (creators) with bounty posters (clients). Built with Next.js 15, NextAuth, and TailwindCSS featuring real-time workflows, gamification, and beautiful UI.

[![Next.js](https://img.shields.io/badge/Next.js-15.4.6-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue?style=flat&logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![NextAuth](https://img.shields.io/badge/NextAuth-4.24.11-black?style=flat)](https://next-auth.js.org/)

## ✨ Features

### For Bounty Hunters (Creators)
- 🎨 **Portfolio Showcase** - Display your skills, projects, and experience
- 🎯 **Find & Apply to Bounties** - Browse available opportunities and submit applications
- 💼 **Work Submission** - Upload completed work with notes and attachments
- 🏆 **Gamified Points System** - Earn 100 points per completed bounty
- 📊 **Global Leaderboard** - Compete with creators worldwide
- 💝 **Receive Donations** - Get support from satisfied clients and community
- 📱 **Activity Tracking** - Monitor all your actions and achievements

### For Bounty Posters (Clients)
- 📝 **Create Bounties** - Post tasks with detailed requirements, budget, and deadlines
- 👥 **Review Applications** - Manage incoming applications with filtering
- ✅ **Accept/Reject Work** - Review submissions and provide feedback
- 📊 **Dashboard Analytics** - Track active, completed, and expired bounties
- 🔍 **Applicant Management** - View creator profiles and work history

### Platform Features
- 🔐 **Google OAuth Authentication** - Secure login with NextAuth
- 🎭 **Role-Based Access Control** - Separate experiences for hunters and posters
- 🔍 **Advanced Filtering** - Search bounties by category, budget, deadline
- 📱 **Responsive Design** - Seamless experience across all devices
- 💾 **Local Data Persistence** - Smart localStorage with automatic cleanup

## 🚀 Tech Stack

### Frontend
- **Framework:** Next.js 15.4.6 with App Router & Turbopack
- **UI Library:** React 19.1.0
- **Styling:** TailwindCSS 4.0 with custom animations
- **Components:** Radix UI, Custom component library
- **Icons:** Heroicons, Lucide React
- **Fonts:** Inter, Poppins, Playfair Display, Space Grotesk

### Backend & Auth
- **Authentication:** NextAuth.js with Google Provider
- **API Routes:** Next.js API Routes
- **Data Storage:** LocalStorage (with migration to database ready)
- **State Management:** React Hooks + Custom utility modules

### Key Libraries
```json
{
  "next": "15.4.6",
  "react": "19.1.0",
  "next-auth": "4.24.11",
  "tailwindcss": "^4",
  "@heroicons/react": "^2.2.0",
  "react-hot-toast": "^2.5.2"
}
```

## 📁 Project Structure

```
bountera/
├── app/                          # Next.js App Router
│   ├── api/auth/[...nextauth]/  # NextAuth API routes
│   ├── activity/                # Activity feed page
│   ├── applicants/              # View/manage applicants
│   ├── bounties/                # Browse bounties
│   ├── bounty-dashboard/        # Poster dashboard
│   ├── create-bounty/           # Create new bounty
│   ├── dashboard/               # Hunter dashboard
│   ├── leaderboard/             # Global rankings
│   ├── login/                   # Login page
│   ├── my-applications/         # Hunter applications
│   ├── my-bounties/             # Poster bounties
│   ├── my-donations/            # Received donations
│   ├── profile/[username]/      # Public user profiles
│   ├── profile-setup/           # Hunter profile setup
│   ├── bounty-poster-setup/     # Poster profile setup
│   ├── globals.css              # Global styles
│   ├── layout.js                # Root layout
│   └── page.js                  # Landing page
│
├── components/                   # React Components
│   ├── ui/                      # Radix UI components
│   ├── BountyCard.js            # Bounty display card
│   ├── BountyModal.js           # Bounty details modal
│   ├── BountyHunterDashboard.js # Hunter dashboard
│   ├── BountyHunterNavbar.js    # Hunter navigation
│   ├── BountyPosterDashboard.js # Poster dashboard
│   ├── BountyPosterNavbar.js    # Poster navigation
│   ├── Hero.js                  # Landing hero section
│   ├── Features.js              # Features showcase
│   ├── TopCreators.js           # Top creators display
│   ├── Navbar.js                # Public navbar
│   ├── Footer.js                # Footer
│   ├── RoleSelectionModal.js    # Role selection
│   └── SessionWrapper.js        # Auth wrapper
│
├── utils/                        # Utility Modules
│   ├── userData.js              # User data management
│   ├── bountyData.js            # Bounty CRUD operations
│   ├── applicationData.js       # Application workflow
│   ├── pointsSystem.js          # Gamification logic
│   ├── donationData.js          # Donation management
│   ├── activityData.js          # Activity logging
│   └── storageManager.js        # Storage optimization
│
├── lib/                         # Shared utilities
│   └── utils.js                 # Helper functions
│
└── public/                      # Static assets
    ├── defaultpfp.jpg           # Default profile picture
    ├── defaultbanner.jpeg       # Default banner
    └── manifest.json            # PWA manifest
```

## 🎨 Design Features

- **✨ Floating Animations** - Smooth, jitter-free card animations
- **🎭 Dual Color Themes** - Pink for hunters, Purple for posters
- **💫 Glassmorphism** - Modern frosted glass effects
- **🎨 Custom Components** - 20+ reusable UI components
- **📱 Mobile-First** - Fully responsive across all breakpoints

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm
- Google OAuth credentials (for authentication)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Flare3416/Bountera.git
   cd bountera
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## � Available Scripts

```bash
npm run dev      # Start development server with Turbopack
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
npm run clean    # Clean build artifacts
```

## 🌟 Key Features Explained

### Points System
- **Daily Login:** 1 point
- **Bounty Application:** 5 points
- **Bounty Completion:** 100 points
- **Profile Completion:** 10 points

### Application Workflow
1. Hunter applies to bounty
2. Poster reviews applications
3. Poster accepts an applicant
4. Hunter submits completed work
5. Poster reviews and accepts/rejects
6. Points awarded automatically

### Donation System
- Visitors can donate to hunters
- Custom amounts or quick-select options
- Optional messages with donations
- Activity tracking for both parties

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Add Environment Variables in Vercel Dashboard**
   - `NEXTAUTH_URL` → Your Vercel domain
   - `NEXTAUTH_SECRET` → Generate with: `openssl rand -base64 32`
   - `GOOGLE_CLIENT_ID` → From Google Console
   - `GOOGLE_CLIENT_SECRET` → From Google Console

4. **Update Google OAuth Settings**
   - Add your Vercel domain to authorized redirect URIs
   - Format: `https://your-domain.vercel.app/api/auth/callback/google`

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXTAUTH_URL` | App URL (http://localhost:3000 or production URL) | Yes |
| `NEXTAUTH_SECRET` | Secret key for JWT encryption | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | Yes |

## 🎯 Future Enhancements

- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Real-time notifications
- [ ] Payment integration (Stripe)
- [ ] File upload to cloud storage
- [ ] Email notifications
- [ ] Advanced analytics dashboard
- [ ] Team collaboration features
- [ ] API rate limiting
- [ ] Search optimization

## 🤝 Contributing

Contributions are welcome! Feel free to:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍� Author

**Flare**
- GitHub: [@Flare3416](https://github.com/Flare3416)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting
- Radix UI for accessible components
- TailwindCSS for the styling system

---

Built with ❤️ and ☕ - **Where Talent Meets Opportunity** 🌸
