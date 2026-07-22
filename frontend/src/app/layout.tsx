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
        <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&display=swap" rel="stylesheet" />
        
        {/* PWA Configurations */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#82c99b" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AI Resume Builder" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* Service Worker Registration */}
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/service-worker.js').then(
                  function(reg) {
                    console.log('ServiceWorker registered with scope: ', reg.scope);
                  },
                  function(err) {
                    console.error('ServiceWorker registration failed: ', err);
                  }
                );
              });
            }
          `
        }} />
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

