import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import '@/app/globals.css';
import Sidebar from '@/components/Sidebar/Sidebar';
import ModalManager from '@/components/Modals/ModalManager';

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: 'DSSMITH Advanced Dashboard',
  description: 'Advanced Dashboard',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
        <div className="flex w-full h-screen overflow-hidden">
          <aside>
            <Sidebar />
          </aside>
          <main className="flex-1 w-screen bg-[var(--background)] overflow-auto py-6 px-8">{children}</main>
        </div>
        <ModalManager />
      </body>
    </html>
  );
}
