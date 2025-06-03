import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import LayoutContainer from "@/components/Background";
import { ThemeProvider } from "@/context/ThemeContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Gërmo - Find Your Dream Job",
  description: "Discover and apply to the best job opportunities with Gërmo - Your trusted job search companion",
  keywords: "jobs, career, employment, job search, job board, job listings",
  authors: [{ name: "Gërmo" }],
  openGraph: {
    title: "Gërmo - Find Your Dream Job",
    description: "Discover and apply to the best job opportunities with Gërmo",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon.ico", sizes: "any" }
    ],
    apple: [
      { url: "/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/favicon/android-chrome-192x192.png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon/favicon-16x16.png" sizes="16x16" type="image/png" />
        <link rel="icon" href="/favicon/favicon-32x32.png" sizes="32x32" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon/apple-touch-icon.png" sizes="180x180" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <LayoutContainer>
            {children}
          </LayoutContainer>
        </ThemeProvider>
      </body>
    </html>
  );
}
