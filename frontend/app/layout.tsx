'use client';

import { SessionProvider } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import UploadManager from '@/components/UploadManager';
import PersistentMediaPlayer from '@/components/PersistentMediaPlayer';
import { UploadProvider } from '@/contexts/UploadContext';
import { MediaPlayerProvider } from '@/contexts/MediaPlayerContext';
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white`} suppressHydrationWarning>
        <SessionProvider>
          <UploadProvider>
            <MediaPlayerProvider>
              {isLoginPage ? (
                children
              ) : (
                <>
                  <div className="flex h-screen overflow-hidden">
                    <Sidebar />
                    <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-16 md:pt-8">
                      {children}
                    </main>
                  </div>
                  <UploadManager />
                  <PersistentMediaPlayer />
                </>
              )}
            </MediaPlayerProvider>
          </UploadProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
