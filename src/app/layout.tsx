import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { params } from "@/common/config/params";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  title: params.name,
  description: params.description,
  keywords: [
    "SEC filings",
    "10-K",
    "10-Q",
    "financial analysis",
    "AI analysis",
    "EDGAR",
    "stock analysis",
  ],
  authors: [{ name: params.name }],
  creator: params.name,
  publisher: params.name,
  icons: {
    icon: [
      {
        url: params.favicon,
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icons/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon.ico", sizes: "any" },
    ],
    shortcut: [
      {
        url: params.favicon,
        sizes: "192x192",
        type: "image/png",
      },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  manifest: "/icons/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    siteName: params.name,
    title: params.name,
    description: params.description,
    images: [
      {
        url: "/icons/og-image.png",
        width: 1200,
        height: 630,
        alt: `${params.name} - ${params.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: params.name,
    description: params.description,
    images: ["/icons/og-image.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: params.name,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
