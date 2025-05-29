import './globals.css';
import type { Metadata } from 'next';
import type { Metric } from 'web-vitals';
import { initMonitoring, reportWebVitals as reportMetric } from '../utils/monitoring';
import { ErrorBoundary } from '../components/shared/ErrorBoundary';
import FeedbackButton from '../components/feedback/FeedbackButton';
import '../utils/env-validator';

// Initialize monitoring on client side
if (typeof window !== 'undefined') {
  initMonitoring();
}

// Report web vitals
export function reportWebVitals(metric: Metric) {
  reportMetric(metric);
}

export const metadata: Metadata = {
  title: 'Meridian Mastery',
  description: 'Learn and master meridian points through interactive flashcards and visual learning',  viewport: 'width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover',
  themeColor: '#111111'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link 
          rel="preconnect" 
          href="https://fonts.gstatic.com" 
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700;800&display=swap"
          rel="stylesheet"
        />
      </head>      <body className="min-h-screen bg-gradient-to-br from-[#111111] to-[#181818]">
        <ErrorBoundary>
          {children}
          <FeedbackButton />
        </ErrorBoundary>
      </body>
    </html>
  );
}
