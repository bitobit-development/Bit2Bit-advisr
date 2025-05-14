// app/layout.tsx
import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import "./globals.css";

export const metadata: Metadata = {
  title: "Advisr - Lead the market",
  description: "Bit2Bit © 2025 – Empowering financial tools",
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={GeistSans.className}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>

      {/* Apply relative positioning to body */}
      <body className="relative min-h-screen flex items-center justify-center">
        {/* Background image covering entire viewport */}
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center opacity-10"
          style={{ backgroundImage: "url('/vitality-bg.jpg')" }}
        />

        {/* Original content, untouched */}
        {children}

      </body>
    </html>
  );
}
