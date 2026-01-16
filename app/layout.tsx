import type React from "react"
import type { Metadata } from "next"
// Import Inter font instead of Geist
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import "./globals.css"
import { SmoothScroll } from "@/components/smooth-scroll"

// Use Inter with thin weight (100) for the entire app
const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "600", "700"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Innovation Skirting - New Zealand's #1 Skirting Specialist | Best Prices, Highest Quality",
  description:
    "Innovation Skirting is New Zealand's only specialized skirting company. Best prices, highest quality LED skirting boards. Order premium skirting boards in New Zealand today. Skirting boards only - we specialize in skirting!",
  keywords: [
    "skirting",
    "skirting boards",
    "skirting New Zealand",
    "LED skirting",
    "aluminium skirting",
    "baseboard",
    "skirting boards NZ",
    "Innovation Skirting",
    "best skirting prices",
    "highest quality skirting",
    "skirting specialist",
    "skirting only",
    "premium skirting",
    "smart skirting",
    "RGB skirting",
  ],
  openGraph: {
    title: "Innovation Skirting - New Zealand's #1 Skirting Specialist",
    description: "New Zealand's only specialized skirting company. Best prices, highest quality LED skirting boards.",
    type: "website",
    locale: "en_NZ",
  },
  twitter: {
    card: "summary_large_image",
    title: "Innovation Skirting - New Zealand's Skirting Specialists",
    description: "Best prices, highest quality skirting boards in New Zealand. Skirting boards only.",
  },
  alternates: {
    canonical: "https://innovationskirting.co.nz",
  },
  icons: {
    icon: [
      { url: "/icon.png", sizes: "any" },
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.png", sizes: "192x192", type: "image/png" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en-NZ">
      <body className={`${inter.variable} font-sans antialiased`}>
        <SmoothScroll />
        {children}
        <Analytics />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
