import type { Metadata } from "next";
import localFont from "next/font/local";
import { Plus_Jakarta_Sans } from "next/font/google";
import "@/app/globals.css";
import { Providers } from "@/app/providers";

/** UI typeface: friendly, highly legible, with even figures for times and record numbers. */
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "CliniQ - Clinic Management System",
  description: "Modern, secure healthcare management platform for community clinics.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Font variables live on <html>: Tailwind sets font-family there, and it must resolve them.
    <html lang="en" className={`${plusJakartaSans.variable} ${geistMono.variable}`}>
      <body className="bg-background font-sans text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
