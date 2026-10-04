import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'ඡායාරූප ගැලරිය',
  description: 'ශ්‍රී බෝධිරුක්ඛාරාම විහාරස්ථානයේ පින්කම්, උත්සව සහ ප්‍රජා වැඩසටහන්වල ඡායාරූප.',
  alternates: {
    canonical: '/gallery',
  },
  openGraph: {
    title: `ඡායාරූප ගැලරිය | ${SITE_NAME}`,
    description: 'විහාරස්ථානයේ පින්කම්, උත්සව සහ ප්‍රජා වැඩසටහන්වල ඡායාරූප.',
    type: 'website',
    url: `${SITE_URL}/gallery`,
  },
};

export default function GalleryLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
