import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GospelLift — Your music, moving forward',
  description: 'A secure home for gospel artists to submit music and plan their next release.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
