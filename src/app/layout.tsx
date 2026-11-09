import type { Metadata } from 'next';
import { Instrument_Sans, Instrument_Serif } from 'next/font/google';
import './globals.css';

const sans = Instrument_Sans({ variable: '--font-instrument-sans', subsets: ['latin'] });
const serif = Instrument_Serif({ variable: '--font-instrument-serif', subsets: ['latin'], weight: '400' });

export const metadata: Metadata = {
  title: { default: 'Cash Book Admin', template: '%s · Cash Book Admin' },
  description: 'Admin dashboard for the Cash Book app.',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
