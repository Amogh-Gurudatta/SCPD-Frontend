import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { DataProvider } from '@/context/DataContext';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SCPD | Tactical Terminal',
  description: 'Dual-theme high performance surveillance and underground spatial dashboard',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen antialiased`}>
        <ThemeProvider>
          <DataProvider>
            {children}
            <Toaster position="top-right" theme="dark" />
          </DataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
