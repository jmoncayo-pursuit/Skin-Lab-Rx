import type { Metadata, Viewport } from "next";
import "./globals.css";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Skin Lab Rx — AI Skin Analysis & Product Recommender",
  description:
    "Analyze your skin concerns with AI-powered precision and get personalized skincare product recommendations with virtual try-on.",
  keywords: ["skin analysis", "skincare", "AI", "product recommender", "virtual try-on", "Perfect Corp"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1A1D21",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeToggle />
        <div className="ambient-bg" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
