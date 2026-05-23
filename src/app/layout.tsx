import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TRPCReactProvider } from "@/trpc/client";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import {ClerkProvider} from "@clerk/nextjs"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vibe — AI Website Builder",
  description:
    "Generate complete Next.js websites in seconds using AI. Vibe uses autonomous background workflows, E2B sandboxes, and OpenAI to build and preview full-stack apps from natural language.",
  openGraph: {
    title: "Vibe — AI Website Builder",
    description:
      "Generate complete Next.js websites in seconds using AI.",
    url: "https://vibe-beta-eight.vercel.app",
    siteName: "Vibe",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vibe — AI Website Builder",
    description: "Generate complete Next.js websites in seconds using AI.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
        
    <html lang="en" suppressHydrationWarning>
      <ClerkProvider
        appearance={{
          variables:{
            colorPrimary:"#C96342"
          }
        }}
      >
        <TRPCReactProvider>
          <body
              className={`${geistSans.variable} ${geistMono.variable} antialiased`}
              >
              <ThemeProvider attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
                >
                <Toaster/>
                {children}

              </ThemeProvider>
          </body>
        </TRPCReactProvider>
      </ClerkProvider>
    </html>
  );
}
