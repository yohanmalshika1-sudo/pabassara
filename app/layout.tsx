import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'ශ්‍රී බෝධිරුක්ඛාරාමය - ගණිහිමුල්ල දෙවලපොල',
  description: 'ශ්‍රී බෝධිරුක්ඛාරාම විහාරස්ථානයේ නිල වෙබ් අඩවිය',
  keywords: ['ශ්‍රී බෝධිරුක්ඛාරාමය', 'විහාරස්ථානය', 'ගණිහිමුල්ල', 'දෙවලපොල', 'ධර්මය'],
  openGraph: {
    title: 'ශ්‍රී බෝධිරුක්ඛාරාමය - ගණිහිමුල්ල දෙවලපොල',
    description: 'ශ්‍රී බෝධිරුක්ඛාරාම විහාරස්ථානයේ නිල වෙබ් අඩවිය',
    locale: 'si_LK',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="si">
      <body>
        <div className="buddhist-flag-bar"></div>
        {children}
        <footer className="text-center py-6 bg-slate-900 text-white text-sm mt-12">
          © 2026 ශ්‍රී බෝධිරුක්ඛාරාමය. All Rights Reserved.
        </footer>
      </body>
    </html>
  );
}