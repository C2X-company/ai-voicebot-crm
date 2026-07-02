// app/layout.tsx
import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

const geist = Geist({
  variable: '--font-geist-sans',
  subsets:  ['latin'],
});

export const metadata: Metadata = {
  title:       { template: '%s | VoiceBot CRM', default: 'VoiceBot CRM' },
  description: 'AI-powered outbound admissions calling platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geist.variable} antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}