import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact Skirting NZ | Get a Quote for Skirting Boards",
  description:
    "Contact Innovation Skirting for skirting quotes, installation enquiries, and expert advice. New Zealand's #1 skirting specialists - best prices guaranteed.",
  keywords: [
    "contact skirting NZ",
    "skirting quote NZ",
    "skirting enquiry",
    "buy skirting NZ",
    "skirting boards quote",
    "LED skirting quote",
    "skirting supplier contact",
    "Auckland skirting",
    "Wellington skirting",
    "Christchurch skirting",
  ],
  openGraph: {
    title: "Contact Us | Innovation Skirting NZ",
    description: "Get in touch for skirting quotes and expert advice. New Zealand's #1 skirting specialists.",
    type: "website",
    locale: "en_NZ",
  },
  alternates: {
    canonical: "https://skirting.co.nz/contact",
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
