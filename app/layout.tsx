import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '메모장',
  description: '나만의 메모장',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="h-full overflow-hidden">{children}</body>
    </html>
  );
}
