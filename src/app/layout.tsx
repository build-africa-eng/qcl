// src/app/layout.tsx
import './globals.css';

export const metadata = {
  title: 'QCL App',
  description: 'Quad Core Language - Unified Components Language (QCL)',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 p-6">
        {children}
      </body>
    </html>
  );
}
