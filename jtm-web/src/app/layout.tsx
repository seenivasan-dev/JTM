import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/SessionProvider";
import { ConditionalHeader } from "../components/layout/ConditionalHeader";
import AutoExpirationChecker from "@/components/membership/AutoExpirationChecker";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "JTM Community Management Platform",
  description: "A comprehensive community management platform for non-profit organizations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <AutoExpirationChecker />
          <div className="relative min-h-screen bg-background">
            <ConditionalHeader />
            <main className="relative">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
