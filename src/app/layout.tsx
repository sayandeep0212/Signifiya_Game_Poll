import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vote Your Favorite Game | Signifiya Gaming",
  description: "Created by ard.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased m-0 p-0 w-full min-h-screen`}
        style={{ margin: 0, padding: 0, width: '100vw', minHeight: '100vh', boxSizing: 'border-box' }}
      >
        {children}
      </body>
    </html>
  );
}
