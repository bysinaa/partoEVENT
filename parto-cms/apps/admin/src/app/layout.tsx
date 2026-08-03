import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Parto CMS',
  description: 'Admin dashboard for Parto Event Group',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-surface-0 text-surface-800">
        {children}
      </body>
    </html>
  );
}