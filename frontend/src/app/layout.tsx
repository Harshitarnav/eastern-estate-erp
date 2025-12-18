import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Toaster } from '@/components/ui/Toaster';

// Use a local, cache-friendly fallback font to avoid external downloads during offline builds
const inter = { className: "font-sans" };

export const metadata: Metadata = {
  title: "Eastern Estate ERP - Building Homes, Nurturing Bonds",
  description: "Complete Real Estate Management System - Luxury at Affordable Prices. Track properties, manage leads, bookings, construction, and more.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Eastern Estate",
  },
};

// ✅ Brand theme color
export const viewport: Viewport = {
  themeColor: "#A8211B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          {children}
          <Toaster />
        </ErrorBoundary>
      </body>
    </html>
  );
}
