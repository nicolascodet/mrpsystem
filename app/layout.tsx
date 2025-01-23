import './globals.css';
import Nav from '@/components/nav';
import type { Metadata } from 'next';

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
      <body className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 font-sans antialiased">
        <div className="min-h-screen">
          <Nav />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
