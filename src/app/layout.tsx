import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/shadcn/components/ui/sonner";
import { AuthProviders } from "@/components/auth/provider";
import { NavBar } from "@/components/nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bonanzbar Verwaltung",
  description: "Verwaltungsapp der Bonanzbar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProviders>
          <nav>
            <NavBar />
          </nav>
          <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16">
            {children}
          </main>
          <Toaster position="top-right" />
        </AuthProviders>
      </body>
    </html>
  );
}
