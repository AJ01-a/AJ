import type { Metadata, Viewport } from 'next';
import { Inter, Orbitron } from 'next/font/google';

import './globals.css';
import {
  APP_NAME,
  APP_TAGLINE,
  APP_VERSION,
  CREATOR_NAME,
} from '@/config/site';
import { WEBSITE_URL } from '@/config/site-url';
import { GAME_COUNT } from '@/data/games';

// Self-hosted at build time by next/font: no render-blocking request to a
// third party, and no layout shift when the face swaps in.
const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['500', '700', '800', '900'],
  variable: '--font-orbitron',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const description =
  `${GAME_COUNT} original arcade, puzzle, math, memory, reaction and word ` +
  `games in one Android app. Plays offline, with no ads, no tracking and ` +
  `no account. Free to download.`;

export const metadata: Metadata = {
  metadataBase: new URL(WEBSITE_URL),
  title: {
    default: `${APP_NAME} — Classic Games & Brain Challenges`,
    template: `%s — ${APP_NAME}`,
  },
  description,
  applicationName: APP_NAME,
  authors: [{ name: CREATOR_NAME }],
  creator: CREATOR_NAME,
  keywords: [
    'RetroMind Arcade', 'arcade games', 'puzzle games', 'brain games',
    'offline games', 'Android APK', 'word games', 'memory games',
    'reaction games', 'math games', 'no ads games',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: WEBSITE_URL,
    siteName: APP_NAME,
    title: `${APP_NAME} — ${APP_TAGLINE}`,
    description,
    images: [
      {
        url: '/images/og.jpg',
        width: 1200,
        height: 630,
        alt: `${APP_NAME} — ${APP_TAGLINE}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${APP_NAME} — ${APP_TAGLINE}`,
    description,
    images: ['/images/og.jpg'],
  },
  icons: {
    icon: [
      { url: '/icons/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/icons/icon-180.png',
  },
  manifest: '/manifest.webmanifest',
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#04060f',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

/**
 * Structured data describing the app itself.
 *
 * Every field is verifiable against the shipped build: the price really is
 * zero, the category really is a game, and the version matches the APK the
 * download button serves.
 */
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: APP_NAME,
  applicationCategory: 'GameApplication',
  operatingSystem: 'Android 7.0+',
  softwareVersion: APP_VERSION,
  description,
  author: { '@type': 'Person', name: CREATOR_NAME },
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${orbitron.variable} ${inter.variable}`}>
      <body className="antialiased">
        <a href="#download" className="skip-link">
          Skip to download
        </a>
        {children}
        <script
          type="application/ld+json"
          // Static, author-controlled JSON; no user input reaches this.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}
