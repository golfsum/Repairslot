import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://repairslot.com'),
  title: {
    default: 'RepairSlot | Repair Scheduling & Online Booking',
    template: '%s | RepairSlot',
  },
  description: 'Online booking and scheduling software for repair businesses. Let customers book real service windows 24/7 and recover missed calls.',
  keywords: [
    'repair scheduling software',
    'repair booking software',
    'online booking for repair businesses',
    'service scheduling software',
    'field service online booking',
    'appliance repair scheduling software',
    'garage door scheduling software',
    'mobile mechanic scheduling software',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: 'https://repairslot.com',
    siteName: 'RepairSlot',
    title: 'RepairSlot | Turn Repair Requests Into Booked Jobs',
    description: '24/7 online booking for repair businesses, with hosted booking pages, inline embeds, and website widgets.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RepairSlot | Online Booking for Repair Businesses',
    description: 'Let repair customers choose real service windows and book jobs 24/7.',
  },
  robots: { index: true, follow: true },
};

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'RepairSlot',
  url: 'https://repairslot.com',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description: 'Online booking and scheduling software for repair businesses.',
  offers: [
    { '@type': 'Offer', price: '49', priceCurrency: 'USD', category: 'Starter' },
    { '@type': 'Offer', price: '99', priceCurrency: 'USD', category: 'Pro' },
    { '@type': 'Offer', price: '199', priceCurrency: 'USD', category: 'Business' },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
        />
      </body>
    </html>
  );
}
