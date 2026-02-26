import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/SessionProvider";
import AutoExpirationChecker from "@/components/membership/AutoExpirationChecker";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
});

export const viewport: Viewport = {
  themeColor: "#2563eb",
};

export const metadata: Metadata = {
  title: "JTM Community Management Platform",
  description: "A comprehensive community management platform for non-profit organizations",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "JTM",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <AutoExpirationChecker />
          <div className="relative min-h-screen bg-background">
            <main className="relative">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
