import type { Metadata } from 'next';
import { Poppins, Rajdhani } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import siteConfig from '@/lib/siteConfig';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  variable: '--font-poppins',
  display: 'swap',
});

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-rajdhani',
  display: 'swap',
});

export const metadata: Metadata = {
  title: siteConfig.title,
  description: 'Cinematic GTA 5 edits, graphic & visual design portfolio.',
  keywords: ['YAMLOK', 'GTA 5 edits', 'gaming portfolio', 'cinematic edits'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${rajdhani.variable}`}>
      <body className="overflow-x-hidden min-h-screen" style={{ background: 'var(--bg-deep)', color: 'var(--text-hi)' }}>
        {children}
        <Toaster
          position="bottom-right"
          containerStyle={{ zIndex: 99999 }}
          toastOptions={{ style: { background: 'transparent', boxShadow: 'none', padding: 0 } }}
        />
      </body>
    </html>
  );
}
