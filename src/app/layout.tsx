import type { Metadata } from "next";
import { Marcellus, Noto_Sans } from "next/font/google";
import "./globals.css";
import { getSiteUrl } from "@/lib/site-url";

const headingFont = Marcellus({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: "400",
});

const bodyFont = Noto_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "Siddheshwari Mataji Temple Rampura",
  description: "Temple website for Prasang, Donors, Aarti Time and Announcements",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${headingFont.variable} ${bodyFont.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
