import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Document AI Processing System',
  description: 'Upload, process, and extract data from your documents using AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
} 