import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Critter Arena",
  description:
    "Turn your resin critter figurine into a battle-ready card. Upload a photo, roll stats with 3D dice, print a certificate, and duel your friends!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fredoka.variable} ${nunito.variable} antialiased`}
      >
        <nav className="print:hidden sticky top-0 z-50 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-amber-400 shadow-lg">
          <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
            <Link
              href="/"
              className="font-display text-2xl font-bold tracking-tight text-white drop-shadow-sm"
            >
              Critter Arena
            </Link>

            <div className="flex items-center gap-2 text-sm font-semibold">
              <Link
                href="/generate"
                className="rounded-full px-4 py-1.5 text-white/90 transition-all hover:bg-white/20 hover:text-white"
              >
                Register a Critter
              </Link>
              <Link
                href="/maps"
                className="rounded-full px-4 py-1.5 text-white/90 transition-all hover:bg-white/20 hover:text-white"
              >
                Battlefields
              </Link>
              <Link
                href="/shop"
                className="rounded-full px-4 py-1.5 text-white/90 transition-all hover:bg-white/20 hover:text-white"
              >
                Shop
              </Link>
              <Link
                href="/rules"
                className="rounded-full px-4 py-1.5 text-white/90 transition-all hover:bg-white/20 hover:text-white"
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
