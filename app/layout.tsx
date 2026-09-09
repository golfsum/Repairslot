import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RepairSlot | Turn repair requests into booked jobs',
  description: '24/7 online booking for repair businesses. Let customers choose real service windows, recover missed calls, and book jobs after hours.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
