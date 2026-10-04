import './globals.css';
import { ReactNode } from 'react';
import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/lib/site-config';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - ගණිහිමුල්ල, දෙවලපොල`,
    template: `%s | ${SITE_NAME}`,
  },
  description: 'ගණිහිමුල්ල, දෙවලපොල ශ්‍රී බෝධිරුක්ඛාරාම විහාරස්ථානයේ නිල වෙබ් අඩවිය. විහාරස්ථානයේ පුවත්, ධර්ම පාසල, පින්කම්, දෛනික පූජා වේලාවන් සහ ඡායාරූප ගැලරිය.',
  applicationName: SITE_NAME,
  keywords: [
    'ශ්‍රී බෝධිරුක්ඛාරාමය',
    'බෝධිරුක්ඛාරාම විහාරස්ථානය',
    'ගණිහිමුල්ල',
    'දෙවලපොල',
    'බෞද්ධ විහාරය',
    'දහම් පාසල',
    'Sri Bodhirukkarama Temple',
    'Ganihimulla Devalapola',
    'Buddhist temple Sri Lanka',
  ],
  alternates: {
    canonical: '/',
  },
  verification: {
    google: 'NqVJYKfuDCLwpLvdxir65_TT_cQBllJtyiq6JKeFF6I',
  },
  openGraph: {
    title: `${SITE_NAME} - ගණිහිමුල්ල, දෙවලපොල`,
    description: 'විහාරස්ථානයේ පුවත්, ධර්ම පාසල, පින්කම්, දෛනික පූජා වේලාවන් සහ ඡායාරූප ගැලරිය.',
    locale: 'si_LK',
    siteName: SITE_NAME,
    type: 'website',
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} - ගණිහිමුල්ල, දෙවලපොල`,
    description: 'ශ්‍රී බෝධිරුක්ඛාරාම විහාරස්ථානයේ නිල වෙබ් අඩවිය.',
    images: ['/opengraph-image'],
  },
  icons: {
    icon: '/temple-logo.svg',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const templeStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'BuddhistTemple',
  '@id': `${SITE_URL}/#temple`,
  name: SITE_NAME,
  alternateName: 'Sri Bodhirukkarama Temple',
  url: SITE_URL,
  image: `${SITE_URL}/opengraph-image`,
  description: 'ශ්‍රී බෝධිරුක්ඛාරාම විහාරස්ථානයේ නිල වෙබ් අඩවිය.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Ganihimulla, Devalapola',
    addressCountry: 'LK',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="si">
      <body>
        <div className="buddhist-flag-bar"></div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(templeStructuredData) }}
        />
        {children}
        <footer className="text-center py-6 bg-slate-900 text-white text-sm mt-12">
          © {new Date().getFullYear()} ශ්‍රී බෝධිරුක්ඛාරාමය. All Rights Reserved.
        </footer>
      </body>
    </html>
  );
}