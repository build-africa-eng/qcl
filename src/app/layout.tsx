import './globals.css';

export const metadata = {
  title: 'QCL App',
  description: 'Quad Core Language - Unified Components Language (QCL)',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}
