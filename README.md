# 🌸 Bountera - Where Talent Meets Opportunity

A modern, elegant platform that connects creators with opportunities through portfolio showcases, bounty hunting, and global rankings. Built with Next.js 15, React 19, and Tailwind CSS.

## ✨ Features

- **🎨 Portfolio Showcase** - Create stunning portfolios to display your work
- **🎯 Bounty Hunting** - Claim and complete bounties from organizations worldwide  
- **🏆 Global Rankings** - Compete on public leaderboards and boost your visibility
- **👥 Creator Community** - Connect with talented creators worldwide

## 🚀 Tech Stack

- **Framework:** Next.js 15.4.6 with Turbopack
- **Frontend:** React 19.1.0
- **Styling:** Tailwind CSS 4.0
- **Icons:** Heroicons & Lucide React
- **UI Components:** Radix UI
- **Animations:** Custom CSS animations with smooth floating effects

## 🎨 Design Features

- **Light Pink/Cream Theme** - Elegant and modern color palette
- **Sakura Petals Animation** - Beautiful falling petals background effect
- **Floating Cards** - Smooth, jitter-free floating animations
- **Glassmorphism Effects** - Modern glass-like UI components
- **Custom Typography** - Multiple Google Fonts (Inter, Poppins, Playfair Display, Space Grotesk)
- **Responsive Design** - Mobile-first approach

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
bountera/
├── app/                       # Next.js 15 app directory
│   ├── activity/              # Activity feed pages
│   ├── api/                   # API route handlers
│   ├── applicants/            # Applicants management
│   ├── auth-redirect/         # Auth redirect logic
│   ├── bounties/              # Bounty listings
│   ├── bounty-dashboard/      # Bounty dashboard for posters
│   ├── bounty-poster-setup/   # Poster onboarding
│   ├── create-bounty/         # Bounty creation
│   ├── dashboard/             # User dashboard
│   ├── donate/                # Donation pages
│   ├── donations/             # Donation history
│   ├── leaderboard/           # Global rankings
│   ├── login/                 # Login page
│   ├── migrate/               # Migration utilities
│   ├── my-applications/       # User's applications
│   ├── my-bounties/           # User's bounties
│   ├── profile/               # Profile page
│   ├── profile-setup/         # Profile onboarding
│   ├── globals.css            # Global styles and animations
│   ├── layout.js              # Root layout component
│   └── page.js                # Home page
├── components/                # React components
│   ├── ui/                    # Reusable UI components
│   ├── BountyCard.js
│   ├── BountyModal.js
│   ├── CTA.js
│   ├── DashboardNavbar.js
│   ├── Features.js
│   ├── Footer.js
│   ├── Hero.js
│   ├── Navbar.js
│   ├── PurplePetals.js
│   ├── RoleSelectionModal.js
│   ├── SakuraPetals.js
│   ├── SessionWrapper.js
│   └── TopCreators.js
├── lib/                       # Utility functions
│   ├── mongodb.js
│   └── utils.js
├── models/                    # Mongoose models
│   ├── Activity.js
│   ├── Application.js
│   ├── Bounty.js
│   ├── Category.js
│   ├── Donation.js
│   ├── Leaderboard.js
│   ├── payment.js
│   └── User.js
├── public/                    # Static assets
│   ├── defaultbanner.jpeg
│   ├── defaultpfp.jpg
│   ├── delete-icon.svg
│   ├── edit-icon.svg
│   ├── manifest.json
│   ├── next.svg
│   └── vercel.svg
├── utils/                     # Backend utilities
│   ├── activityDataMongoDB.js
│   ├── applicationDataMongoDB.js
│   ├── authMongoDB.js
│   ├── bountyDataMongoDB.js
│   ├── donationDataMongoDB.js
│   ├── pointsSystemMongoDB.js
│   └── userDataMongoDB.js
├── .env.local                 # Local environment variables
├── .gitignore                 # Git ignore file
├── eslint.config.mjs          # ESLint config
├── jsconfig.json              # JS config
├── next.config.mjs            # Next.js config
├── package.json               # NPM package manifest
├── postcss.config.mjs         # PostCSS config
├── tailwind.config.js         # Tailwind CSS config
└── README.md                  # Project documentation
```

## 🚢 Deployment

- Build: `npm run build`
- Start: `npm start`
- Deploy to Vercel: `npx vercel`

Built with ❤️ - **Where Talent Meets Opportunity** 🌸

---

## 🏁 Application Lifecycle & Donation Flow

### Bounty Workflow
- **Apply for Bounty:** Creators apply via modal form; applications are tracked in MongoDB.
- **Approval:** Bounty poster reviews and approves applicants.
- **Work Submission:** Approved applicants submit work for review.
- **Review & Completion:** Poster reviews submissions, marks applications as completed, and awards points.
- **Feedback:** Both parties can leave feedback after completion.

### Donation Flow
- **Donate to Creators:** Support creators via donation form; requires login and valid user identification.
- **Validation:** Form checks for valid donor/creator ObjectIds and blocks submission if missing.
- **Error Handling:** User-friendly error messages for missing login or invalid data.

## 🗄️ Database
- **MongoDB:** Stores users, applications, bounties, and donations.
- **Models:** User, Application, Donation (see `/utils/applicationDataMongoDB.js` and `/utils/donationDataMongoDB.js`).

## 🧪 Testing the Workflow
1. **Bounty Application:** Apply for a bounty, verify status changes, and check applicant management.
2. **Donation:** Test donation form with valid/invalid login and ObjectIds.
3. **End-to-End:** Complete full bounty lifecycle and donation flow; confirm points awarded and feedback recorded.

---
