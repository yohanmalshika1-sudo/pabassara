import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'විහාරස්ථානයේ පුවත් සහ තොරතුරු',
  description: 'ශ්‍රී බෝධිරුක්ඛාරාම විහාරස්ථානයේ පුවත්, ලිපි, වීඩියෝ සහ ආගමික වැඩසටහන්.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: `විහාරස්ථානයේ පුවත් සහ තොරතුරු | ${SITE_NAME}`,
    description: 'විහාරස්ථානයේ පුවත්, ලිපි, වීඩියෝ සහ ආගමික වැඩසටහන්.',
    type: 'website',
    url: `${SITE_URL}/contact`,
  },
};

export default function ContactLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
