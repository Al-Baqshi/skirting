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

const baseUrl = "https://skirting.co.nz"

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Skirting NZ | Innovation Skirting - New Zealand's #1 Skirting Specialist",
    template: "%s | Innovation Skirting NZ",
  },
  description:
    "Looking for skirting in NZ? Innovation Skirting is New Zealand's only specialized skirting company. Best prices on LED skirting boards, aluminium skirting, and premium skirting boards. Buy skirting boards online in New Zealand today!",
  keywords: [
    "skirting",
    "skirting NZ",
    "skirting New Zealand",
    "skirting boards",
    "skirting boards NZ",
    "LED skirting",
    "LED skirting boards",
    "aluminium skirting",
    "aluminium skirting NZ",
    "baseboard",
    "baseboard NZ",
    "Innovation Skirting",
    "best skirting prices NZ",
    "buy skirting NZ",
    "skirting Auckland",
    "skirting Wellington",
    "skirting Christchurch",
    "premium skirting NZ",
    "smart skirting",
    "RGB skirting",
    "modern skirting",
    "skirting supplier NZ",
    "skirting specialist NZ",
  ],
  authors: [{ name: "Innovation Skirting", url: baseUrl }],
  creator: "Innovation Skirting",
  publisher: "Innovation Skirting",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Skirting NZ | Innovation Skirting - New Zealand's #1 Skirting Specialist",
    description: "New Zealand's only specialized skirting company. Best prices, highest quality LED skirting boards. Shop premium skirting boards online.",
    type: "website",
    locale: "en_NZ",
    url: baseUrl,
    siteName: "Innovation Skirting NZ",
    images: [
      {
        url: "/skirting.png",
        width: 1200,
        height: 630,
        alt: "Innovation Skirting - Premium LED Skirting Boards in New Zealand",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Skirting NZ | Innovation Skirting - New Zealand's Skirting Specialists",
    description: "Best prices, highest quality skirting boards in New Zealand. LED skirting, aluminium skirting & more.",
    images: ["/skirting.png"],
  },
  alternates: {
    canonical: baseUrl,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
  verification: {
    // Add your Google Search Console verification code here when you have it
    // google: "your-google-verification-code",
  },
  category: "Home Improvement",
}

// JSON-LD structured data for SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      name: "Innovation Skirting",
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/skirting.png`,
      },
      description: "New Zealand's only specialized skirting company. Premium LED skirting boards at the best prices.",
      areaServed: {
        "@type": "Country",
        name: "New Zealand",
      },
      sameAs: [],
    },
    {
      "@type": "WebSite",
      "@id": `${baseUrl}/#website`,
      url: baseUrl,
      name: "Innovation Skirting NZ",
      description: "New Zealand's #1 skirting specialist",
      publisher: {
        "@id": `${baseUrl}/#organization`,
      },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${baseUrl}/products?search={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "LocalBusiness",
      "@id": `${baseUrl}/#localbusiness`,
      name: "Innovation Skirting",
      description: "New Zealand's only specialized skirting company offering premium LED skirting boards, aluminium skirting, and smart skirting solutions.",
      url: baseUrl,
      image: `${baseUrl}/skirting.png`,
      priceRange: "$$",
      areaServed: [
        { "@type": "City", name: "Auckland" },
        { "@type": "City", name: "Wellington" },
        { "@type": "City", name: "Christchurch" },
        { "@type": "City", name: "Hamilton" },
        { "@type": "City", name: "Tauranga" },
        { "@type": "Country", name: "New Zealand" },
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Skirting Boards NZ",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Product",
              name: "LED Skirting Boards",
              description: "Premium aluminium skirting boards with integrated LED lighting. Best skirting prices in NZ.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Product",
              name: "Aluminium Skirting Boards",
              description: "High-quality aluminium skirting boards for homes and commercial. NZ skirting specialist.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Product",
              name: "Smart Skirting Boards",
              description: "WiFi-enabled smart skirting boards with app and voice control. Innovation Skirting NZ.",
            },
          },
        ],
      },
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en-NZ">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <SmoothScroll />
        {children}
        <Analytics />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
