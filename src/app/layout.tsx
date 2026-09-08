import type { Metadata } from 'next';
import './globals.css';
import { ColdStartBanner } from '@/components/ColdStartBanner';

export const metadata: Metadata = {
  title: 'QR Album Access — Exclusive Digital Music Experience',
  description:
    'Scan your QR code, enter your 6-character access code, and gain instant, permanent access to exclusive digital music albums on your device.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0a0a0f] text-gray-100 min-h-screen flex flex-col selection:bg-brand-500 selection:text-white">
        <ColdStartBanner />
        <main className="flex-1 flex flex-col">{children}</main>
        <footer className="py-6 text-center text-xs text-gray-500 border-t border-white/5">
          <p>© {new Date().getFullYear()} QR Album Access (MelodyPass). Powered by Cloudflare R2 & Neon.</p>
        </footer>
      </body>
    </html>
  );
}
