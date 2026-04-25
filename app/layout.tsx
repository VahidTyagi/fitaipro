import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata2: Metadata = {
  // ...existing...
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "FitAI Pro — AI Fitness Coach | Free Workouts + Personalized Plans",
  description: "Get personalized AI workout plans, Indian meal plans, and real-time coaching. Home workout, gym workout, and equipment workouts. 7-day free diet plan. Join free.",
  keywords: "AI fitness app India, free workout app, home workout India, gym workout AI, diet plan India, fitness tracker, weight loss app India",
  openGraph: {
    title: "FitAI Pro — Your AI-Powered Fitness Coach",
    description: "Free AI workouts + 7-day Indian diet plan. No credit card needed.",
    url: "https://fitaipro-five.vercel.app",
    siteName: "FitAI Pro",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FitAI Pro — AI Fitness Coach",
    description: "Free AI workouts for India. Home, gym & equipment workouts.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          {children}
          <Toaster position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}