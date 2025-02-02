import { Inter } from 'next/font/google';
import './globals.css';
import Nav from '@/components/nav';
import { SessionProvider } from 'next-auth/react';
import type { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MRP System',
  description: 'Manufacturing Resource Planning System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <div className="min-h-screen">
            <Nav />
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </div>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
