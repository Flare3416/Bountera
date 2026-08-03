# ⬡ Bountera

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Neon Database](https://img.shields.io/badge/Neon-PostgreSQL-00E599?logo=neon&logoColor=black)](https://neon.tech/)
[![NextAuth](https://img.shields.io/badge/Auth-NextAuth-000000?logo=nextdotjs)](https://next-auth.js.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

### **A Modern Open-Source Bounty Marketplace**

Create, discover, manage, and complete software bounties through a beautiful role-based platform built with **Next.js**, **NextAuth**, **Tailwind CSS**, and backed by **Prisma** & **Neon PostgreSQL**.

---

<img src="./img/landing.png" width="100%" alt="Bountera Landing Page" style="border-radius: 8px; box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);"/>

</div>

---

## ✨ Overview

**Bountera** is a premium full-stack bounty marketplace designed for developers and organizations to collaborate seamlessly on open-source projects. 

Bountera provides two tailored experiences:

### 🎯 Bounty Posters
For companies, startups, and individuals who want to scale their engineering output:
*   **Post Bounties**: Create detailed software tasks with difficulty categories, deliverables, and budgets.
*   **Manage Applications**: Review applicant profiles, experience, and portfolios to accept or reject candidates.
*   **Monitor Progress**: Track assignments from acceptance to submission and completion.
*   **Reward Talent**: Validate submitted work and award completion points and reputation.

### 👨‍💻 Creators / Bounty Hunters
For developers seeking to build proof-of-work, gain reputation, and earn:
*   **Discover Opportunities**: Browse, search, and filter open bounties by tech stack, difficulty, and budget.
*   **Apply to Tasks**: Pitch yourself with custom application messages and track status in real-time.
*   **Showcase Profiles**: Auto-generate developer portfolios including experiences, projects, skills, and achievements.
*   **Gamified Rankings**: Earn completion points to rise in global community leaderboards.

---

## 🚀 Key Features

*   **🔐 Seamless Authentication**: Google & GitHub OAuth via NextAuth with secure session management.
*   **👥 Dual-Role System**: Dynamic dashboard switching between *Bounty Hunter* and *Bounty Poster* roles.
*   **💼 Robust Bounty Engine**: Full CRUD capabilities for bounties including filtering, expiration handling, and statuses (`OPEN`, `COMPLETED`, `EXPIRED`, `CANCELLED`).
*   **📨 Real-time Application Pipeline**: Interactive applicant submission tracking, code review interface, and feedback loops.
*   **🏆 Global Leaderboard & Points**: Gamification layer tracking reputation, activity feed logs, and ranking.
*   **💳 Donation Ledger**: Log contributions and tip creators with Razorpay integration ready.
*   **🎨 Premium Glassmorphic UI**: Built using Tailwind CSS 4 with custom dark mode gradients, micro-animations, and fully responsive layouts.

---

## 🖼 UI Showcase

### Landing Page
<p align="center">
  <img src="./img/landing.png" width="95%" style="border-radius: 8px;" alt="Landing Page">
</p>

### Developer & Poster Dashboard
<p align="center">
  <img src="./img/dashboard.png" width="95%" style="border-radius: 8px;" alt="Dashboard">
</p>

### Bounty Management Center
<p align="center">
  <img src="./img/manage_bounties.png" width="95%" style="border-radius: 8px;" alt="Bounty Management">
</p>

---

## 🧠 Application Architecture

Bountera has transitioned from static local storage to a full-stack architecture backed by Serverless PostgreSQL.

```text
                  User
                    │
                    ▼
            Next.js App Router
                    │
         ┌──────────┴──────────┐
         │                     │
         ▼                     ▼
    NextAuth.js         Role Detection
 (Google & GitHub)             │
         │                     │
         └──────────┬──────────┘
                    ▼
             Protected Routes
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
  Creator / Hunter       Bounty Poster
     Dashboard             Dashboard
        │                       │
        └───────────┬───────────┘
                    ▼
            Shared Components
                    │
                    ▼
             Prisma ORM Client
                    │
                    ▼
             Neon PostgreSQL
           (Serverless Database)
```

---

## 🛠 Tech Stack

| Category | Technology | Description |
|-----------|------------|-------------|
| **Framework** | Next.js 16 | App Router, API Handlers & SSR |
| **Language** | JavaScript (ES2023) | Clean, modular ES6+ syntax |
| **UI Library** | React 19 | Advanced Hook-based components |
| **Styling** | Tailwind CSS 4 & Motion | Modern styling engine with hardware-accelerated animations |
| **Authentication** | NextAuth.js | OAuth 2.0 via Google & GitHub |
| **ORM** | Prisma 6 | Type-safe SQL client and schema migration tool |
| **Database** | Neon PostgreSQL | Serverless database with auto-scaling & branch deployments |
| **Icons** | Lucide React | Clean, scalable vector iconography |
| **Package Manager**| pnpm | High-speed, disk-efficient dependency tracking |
| **Hosting** | Vercel | Seamless CI/CD deployment pipeline |

---

## 📊 Database Schema Relationships

Bountera's database schema maps out relations between users, bounty lifecycles, and user portfolios:

```mermaid
erDiagram
    User {
        string id PK
        string email UK
        string username UK
        UserRole role
        string name
        int points
        boolean profileCompleted
    }
    Bounty {
        string id PK
        string title
        Difficulty difficulty
        float budget
        datetime deadline
        BountyStatus status
        string posterId FK
    }
    BountyApplication {
        string id PK
        ApplicationStatus status
        string message
        string submittedWork
        string bountyId FK
        string applicantId FK
    }
    Activity {
        string id PK
        ActivityType type
        json data
        string userId FK
    }
    Donation {
        string id PK
        float amount
        string donorId FK
        string recipientId FK
    }
    Experience {
        string id PK
        string title
        string company
        string duration
        string userId FK
    }
    Project {
        string id PK
        string title
        string link
        string userId FK
    }

    User ||--o{ Bounty : "posts"
    User ||--o{ BountyApplication : "applies"
    User ||--o{ Activity : "performs"
    User ||--o{ Donation : "sends/receives"
    User ||--o{ Experience : "has"
    User ||--o{ Project : "has"
    Bounty ||--o{ BountyApplication : "receives"
```

---

## 📂 Project Structure

```text
Bountera/
│
├── app/                      # Next.js App Router Pages & API Routes
│   ├── api/                  # API endpoints (Auth, Bounties, Applications)
│   ├── applicants/           # Applicant review interface
│   ├── auth-redirect/        # Smart login redirect router
│   ├── bounties/             # Bounty discovery boards
│   ├── bounty-dashboard/     # Poster dashboard panel
│   ├── bounty-poster-setup/  # Poster role initialization
│   ├── create-bounty/        # Bounty creation/edit portal
│   ├── dashboard/            # Creator/Hunter dashboard panel
│   ├── leaderboard/          # Global community rankings
│   ├── login/                # Authentication UI page
│   ├── my-applications/      # Track user applications
│   ├── my-bounties/          # Poster's active/past bounties
│   ├── my-donations/         # User tips and history logs
│   ├── profile/              # Public creator/hunter portfolios
│   └── profile-setup/        # Hunter profile creator wizard
│
├── components/               # Shared UI Layouts & Core Elements
│
├── lib/                      # Core Singletons & Adapter Clients
│   ├── prisma.js             # Global Prisma Client instance
│   └── utils.js              # General Helper utilities
│
├── prisma/                   # Database Configuration & Schema
│   ├── migrations/           # Automated Neon SQL migration scripts
│   └── schema.prisma         # Prisma Schema models
│
├── utils/                    # Shared Utility Handlers & Scoring Logic
│   ├── activityData.js       # Activity parsing logic
│   ├── bountyConstants.js    # Standard classifications & difficulty maps
│   ├── bountyHelpers.js      # Data validation rules
│   └── pointsSystem.js       # Hunter scoring & leaderboard logic
│
├── public/                   # Static browser assets
├── img/                      # Showcase screenshots for README
├── package.json              # Main project description & scripts
├── tailwind.config.js        # Custom Tailwind styling parameters
└── .gitignore                # Environment, build & log exclusions
```

---

## ⚡ Installation & Local Setup

### 1. Clone & Navigate
```bash
git clone https://github.com/Flare3416/Bountera.git
cd Bountera
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Setup Environment Variables
Create a `.env` file at the root (for Prisma CLI) and a `.env.local` file (for Next.js) using the template:
```bash
cp .env.example .env
cp .env.example .env.local
```
Fill in the variables in your `.env` files:
```env
# Neon Connection URI
DATABASE_URL="postgresql://neondb_owner:password@ep-host-pooler.region.neon.tech/neondb?sslmode=require"

# NextAuth Configurations
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-nextauth-secret"

# Provider Client Credentials
GOOGLE_ID="google-client-id"
GOOGLE_SECRET="google-client-secret"
GITHUB_ID="github-client-id"
GITHUB_SECRET="github-client-secret"
```

### 4. Push Database Schema
Sync your database schema directly with your Neon instance:
```bash
npx prisma db push
```

If you prefer tracking schema version history through official migrations:
```bash
npx prisma migrate dev --name init
```

### 5. Generate Client
Compile your type-safe Prisma client:
```bash
npx prisma generate
```

### 6. Boot Up local environment
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) to view Bountera in action.

---

## 🔒 Security Features

*   **Database-Level Access Checks**: SQL cascade relationships guarantee users can only delete or edit bounties and applications they own.
*   **NextAuth Session Guards**: Middlewares and API endpoint validation checks prevent session hijacking and cross-role exploits.
*   **Strict SQL Escaping**: Prisma automatically parameterizes inputs, ensuring immunity against SQL injection vulnerabilities.
*   **Ignored Environment Files**: `.gitignore` is pre-configured to block sensitive databases, local `.env` values, and secret configuration sheets from leaking onto public Git histories.

---

## 🚧 Roadmap

### ✅ Phase 1: Core Interface
- [x] Modern Glassmorphism UI
- [x] Multi-Role User Detection & Onboarding
- [x] Creator & Bounty Poster Dashboards
- [x] Basic client-side search & filtering

### ✅ Phase 2: PostgreSQL & Prisma Migration
- [x] Transition from Local Storage to **Neon PostgreSQL**
- [x] Define entity models via **Prisma ORM**
- [x] Secure database connection pools
- [x] Persistent profile storage and server-side computations

### 🚧 Phase 3: Real-Time Communication
- [ ] In-App messaging between Posters & Hunters
- [ ] Push/Email notifications for application updates
- [ ] Interactive developer profile recommendations

### 🚧 Phase 4: Enterprise Solutions
- [ ] Multi-member Organization Profiles
- [ ] Advanced bounty metrics & developer activity dashboards
- [ ] Live project code integrations (GitHub API connections)

---

## 🚀 Vercel Deployment & Production

### 1. Build Command Optimization
For smooth deployments on Vercel, it is recommended to ensure Prisma Client is generated on every build. You can modify your Vercel build command to:
```bash
npx prisma generate && next build
```
*Alternatively, adding a `"postinstall": "prisma generate"` script in your `package.json` will automate this step.*

### 2. Register Environment Variables
Set the following keys in your Vercel project configuration:
*   `DATABASE_URL`
*   `NEXTAUTH_URL` (Use your production domain: `https://your-domain.vercel.app`)
*   `NEXTAUTH_SECRET`
*   `GOOGLE_ID` & `GOOGLE_SECRET`
*   `GITHUB_ID` & `GITHUB_SECRET`

---

## 🤝 Contributing

Contributions are welcomed and encouraged!

1. Fork the Repository
2. Create a Feature Branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the Branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 👨‍💻 Author

**Ujjwal Sharma**
*   GitHub: [@Flare3416](https://github.com/Flare3416)
*   LinkedIn: [Ujjwal Sharma](https://linkedin.com/in/ujjwal3416)

---

## 🌟 Support

If you love **Bountera**, please consider giving this project a ⭐ on GitHub. It goes a long way to help the platform gain visibility and supports future development!

<div align="center">

** Built with ❤️ by Ujjwal **

</div>