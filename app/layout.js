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
  title: {
    default: "Bountera — Creative momentum, made visible",
    template: "%s — Bountera",
  },
  description: "The premium creator network for showcasing work, discovering paid bounties, and building a reputation that opens doors.",
  keywords: ["creators", "bounty hunting", "portfolio", "talent", "opportunities", "rankings", "freelance", "creative platform"],
  authors: [{ name: "Bountera Team" }],
  creator: "Bountera",
  publisher: "Bountera",
  
  // Open Graph metadata for social media
  openGraph: {
    title: "Bountera — Creative momentum, made visible",
    description: "Showcase your work, discover paid bounties, and build a reputation that moves your career forward.",
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
    title: "Bountera — Creative momentum, made visible",
    description: "Showcase your work, discover paid bounties, and build creative momentum.",
    creator: "@bountera",
    site: "@bountera",
  },

  // Favicon and icons
  icons: {
    icon: [
      {
        url:
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop stop-color='%2367e8f9'/%3E%3Cstop offset='1' stop-color='%238b5cf6'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='64' height='64' rx='18' fill='url(%23g)'/%3E%3Cpath fill='%23020617' d='m32 13 3.4 12.8L48 29.2l-12.6 3.4L32 45.5l-3.4-12.9L16 29.2l12.6-3.4z'/%3E%3C/svg%3E",
          type: "image/svg+xml",
      },
    ],
    apple: [
      {
        url:
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop stop-color='%2367e8f9'/%3E%3Cstop offset='1' stop-color='%238b5cf6'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='64' height='64' rx='18' fill='url(%23g)'/%3E%3Cpath fill='%23020617' d='m32 13 3.4 12.8L48 29.2l-12.6 3.4L32 45.5l-3.4-12.9L16 29.2l12.6-3.4z'/%3E%3C/svg%3E",
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
  themeColor: "#020617",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
      <head>
        {/* Additional head elements for better performance */}
        <meta name="theme-color" content="#020617" />
        <meta name="color-scheme" content="dark" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Bountera" />
      </head>
      <body className={`${inter.variable} ${poppins.variable} ${playfairDisplay.variable} antialiased`}>
        <SessionWrapper>
          {children}
        </SessionWrapper>
      </body>
    </html>
  );
}
