import type { Metadata } from "next";
import localFont from "next/font/local";

import { PortfolioShell } from "@/src/features/portfolio";

import "./globals.css";

const jetbrainsMono = localFont({
  src: "../public/fonts/JetBrainsMono-Variable.ttf",
  variable: "--font-jetbrains-mono",
  display: "swap",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Jared Tucker",
  description: "Personal Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jetbrainsMono.variable} suppressHydrationWarning>
      <body className="lowercase scheme-moonlit tracking-tighter text-[14px] min-h-dvh font-mono text-fg-1">
        <PortfolioShell>{children}</PortfolioShell>
      </body>
    </html>
  );
}
