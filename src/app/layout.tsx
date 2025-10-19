import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SessionProvider } from "@/components/providers/session-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LeetCode Classroom Tracker",
  description: "Track student progress and manage homework assignments for LeetCode practice",
  keywords: ["LeetCode", "Classroom", "Tracker", "Education", "Programming"],
  authors: [{ name: "LeetCode Classroom Tracker Team" }],
  openGraph: {
    title: "LeetCode Classroom Tracker",
    description: "Track student progress and manage homework assignments",
    url: "https://leetcode-classroom-tracker.vercel.app",
    siteName: "LeetCode Classroom Tracker",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LeetCode Classroom Tracker",
    description: "Track student progress and manage homework assignments",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <SessionProvider>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
