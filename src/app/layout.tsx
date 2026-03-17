import type { Metadata } from "next";
import { Marcellus, Noto_Sans } from "next/font/google";
import "./globals.css";

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
  title: "Siddheshwari Mataji Temple Rampura",
  description: "Temple website for Prasang, Donors, Aarti Time and Announcements",
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
