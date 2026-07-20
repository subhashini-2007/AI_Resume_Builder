import type { Metadata } from 'next';
import { AuthProvider } from '../context/AuthContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Resume Builder - Build Your ATS-Optimized Resume',
  description: 'Create professional, ATS-friendly resumes and cover letters in minutes with advanced AI suggestions, scoring, and beautiful templates.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AuthProvider>
          <div className="bg-grid"></div>
          <div className="gradient-glow-1"></div>
          <div className="gradient-glow-2"></div>
          <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
