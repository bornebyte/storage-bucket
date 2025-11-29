'use client';

import { SessionProvider } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white`}>
        <SessionProvider>
          {isLoginPage ? (
            children
          ) : (
            <div className="flex h-screen overflow-hidden">
              <Sidebar />
              <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-16 md:pt-8">
                {children}
              </main>
            </div>
          )}
        </SessionProvider>
      </body>
    </html>
  );
}
