import { Inter, Poppins, Playfair_Display } from "next/font/google";
import "./globals.css";
import SessionWrapper from '@/components/SessionWrapper';

// Font configurations - optimized for Turbopack compatibility
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: "Bountera - Where Talent Meets Opportunity",
  description: "A modern platform connecting creators with opportunities through portfolio showcases, bounty hunting, and global rankings. Join 15K+ creators worldwide.",
  keywords: ["creators", "bounty hunting", "portfolio", "talent", "opportunities", "rankings", "freelance", "creative platform"],
  authors: [{ name: "Bountera Team" }],
  creator: "Bountera",
  publisher: "Bountera",
  
  // Open Graph metadata for social media
  openGraph: {
    title: "Bountera - Where Talent Meets Opportunity",
    description: "Join 15K+ creators on the platform that connects talent with opportunity. Showcase portfolios, hunt bounties, and compete globally.",
    url: "https://bountera.com",
    siteName: "Bountera",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.jpg", // We can add this later
        width: 1200,
        height: 630,
        alt: "Bountera - Creative Platform",
      },
    ],
  },

  // Twitter metadata
  twitter: {
    card: "summary_large_image",
    title: "Bountera - Where Talent Meets Opportunity",
    description: "Join 15K+ creators on the platform that connects talent with opportunity.",
    creator: "@bountera",
    site: "@bountera",
  },

  // Favicon and icons
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌸</text></svg>",
        type: "image/svg+xml",
      },
    ],
    apple: [
      {
        url: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌸</text></svg>",
        type: "image/svg+xml",
      },
    ],
  },

  // Additional metadata
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Verification for search engines (add your actual verification codes)
  verification: {
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // yahoo: "your-yahoo-verification-code",
  },

  // Category for app stores
  category: "business",
};

// Additional metadata for better SEO and performance
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdf2f8" },
    { media: "(prefers-color-scheme: dark)", color: "#1f2937" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Additional head elements for better performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Bountera" />
      </head>
      <body className={`${inter.variable} ${poppins.variable} ${playfairDisplay.variable} antialiased bg-gradient-to-br from-pink-50 via-white to-orange-50`}>
        <SessionWrapper>
          {children}
        </SessionWrapper>
      </body>
    </html>
  );
}
