import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ContentPulse - Content Intelligence for Editorial Teams",
  description: "Know what to publish next with AI-powered content analysis",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} dark bg-slate-950 text-slate-50`}>
        {children}
        <Toaster theme="dark" />
      </body>
    </html>
  );
}
