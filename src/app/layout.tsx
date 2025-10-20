import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Footer } from "@/components/footer"
import { ErrorBoundary } from "@/components/error-boundary"
import { Providers } from "@/components/providers"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "CreatorsMarketCap - Track Creator Coins on Base",
  description:
    "Discover and track creator coins on Base blockchain with real-time market data, trust scores, and creator profiles",
  keywords: ["creator coins", "base blockchain", "crypto", "market cap", "trust scores"],
  openGraph: {
    title: "CreatorsMarketCap - Track Creator Coins on Base",
    description: "Discover and track creator coins on Base blockchain",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <Providers>
          <ErrorBoundary>
            {children}
            <Footer />
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  )
}
