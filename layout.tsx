import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'upnest — Company Portal',
  description: 'Company-side portal for the upnest platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
