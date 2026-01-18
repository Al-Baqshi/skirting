import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Skirting Boards NZ | Buy LED Skirting, Aluminium Skirting Online",
  description:
    "Shop premium skirting boards in New Zealand. LED skirting, aluminium skirting, smart skirting & more. Best prices, highest quality. Buy skirting online NZ.",
  keywords: [
    "skirting boards NZ",
    "buy skirting NZ",
    "skirting online NZ",
    "LED skirting boards",
    "aluminium skirting NZ",
    "smart skirting boards",
    "RGB skirting",
    "skirting prices NZ",
    "cheap skirting NZ",
    "premium skirting",
    "skirting shop NZ",
    "skirting supplier NZ",
    "modern skirting boards",
    "baseboard NZ",
  ],
  openGraph: {
    title: "Skirting Boards NZ | Innovation Skirting",
    description: "Shop premium LED skirting boards online. Best prices, highest quality in New Zealand.",
    type: "website",
    locale: "en_NZ",
  },
  alternates: {
    canonical: "https://skirting.co.nz/products",
  },
}

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
