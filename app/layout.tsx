import './globals.css';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { Providers } from './components/providers';

export const metadata: Metadata = {
  title: 'MRP System',
  description: 'Manufacturing Resource Planning System',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession();

  return (
    <html lang="en">
      <body className="font-sans">
        <Providers session={session}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
