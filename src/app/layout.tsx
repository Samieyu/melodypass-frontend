import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ColdStartBanner } from '@/components/ColdStartBanner';
import { ThemeToggle } from '@/components/ThemeToggle';

export const metadata: Metadata = {
  title: 'QR Album Access — Exclusive Digital Music Experience',
  description:
    'Scan your QR code, enter your 6-character access code, and gain instant, permanent access to exclusive digital music albums on your device.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function() {
              try {
                var theme = localStorage.getItem('melodypass_theme');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            })();`,
          }}
        />
      </head>
      <body className="bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 min-h-screen flex flex-col selection:bg-indigo-600 selection:text-white transition-colors duration-200">
        <ColdStartBanner />
        
        {/* Floating Theme Toggle in top-right */}
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>

        <main className="flex-1 flex flex-col">{children}</main>
        <footer className="py-6 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-white/10 space-y-1 font-medium">
          <p>QR Song Access (ንካኝ ዛሬ). Powered by Samuel Woldemeskel</p>
          <p>&ldquo;Whatever you do, do it all for the glory of God.&rdquo; -1 Corinthians 10:31</p>
          <p>© {new Date().getFullYear()} More Products: +251959828576</p>
        </footer>
      </body>
    </html>
  );
}
