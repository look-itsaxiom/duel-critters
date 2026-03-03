import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
  title: "Duel Critters",
  description:
    "Turn your pet into a battle-ready critter card. Upload a photo, roll stats with 3D dice, print a certificate, and duel your friends!",
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
        <nav className="print:hidden sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
            <Link
              href="/"
              className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
            >
              Duel Critters
            </Link>

            <div className="flex items-center gap-6 text-sm font-medium">
              <Link
                href="/generate"
                className="text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                Register a Critter
              </Link>
              <Link
                href="/maps"
                className="text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                Build a Map
              </Link>
              <Link
                href="/rules"
                className="text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                Rules
              </Link>
            </div>
          </div>
        </nav>

        {children}
      </body>
    </html>
  );
}
