import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Skirting Installation NZ | Professional & DIY Skirting Installation",
  description:
    "Skirting installation in New Zealand - professional installation or easy DIY. Innovation Skirting offers expert skirting board installation services and click-fit systems nationwide.",
  keywords: [
    "skirting installation NZ",
    "skirting installation New Zealand",
    "install skirting boards",
    "professional skirting installation",
    "DIY skirting NZ",
    "skirting boards installation",
    "LED skirting installation",
    "skirting installer Auckland",
    "skirting installer Wellington",
    "skirting installer Christchurch",
  ],
  openGraph: {
    title: "Skirting Installation NZ | Innovation Skirting",
    description: "Professional skirting installation or easy DIY - Innovation Skirting offers expert installation services nationwide.",
    type: "website",
    locale: "en_NZ",
  },
  alternates: {
    canonical: "https://skirting.co.nz/installation",
  },
}

export default function InstallationPage() {
  return (
    <div className="min-h-screen bg-skirting-dark">
      <Header />

      {/* Hero Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-skirting-charcoal to-skirting-dark px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-skirting-amber text-xs sm:text-sm font-bold uppercase tracking-widest">Installation</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-skirting-silver mt-4 sm:mt-6 tracking-tight">
            Choose Your Path
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-skirting-silver/70 mt-4 sm:mt-6 max-w-3xl mx-auto">
            Professional installation or DIY - we have the perfect solution for your New Zealand home or business.
          </p>
        </div>
      </section>

      {/* Installation Options */}
      <section className="py-12 sm:py-16 lg:py-20 bg-skirting-charcoal px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16">
            {/* Professional Installation */}
            <div className="bg-skirting-dark border-2 border-skirting-amber p-6 sm:p-8 relative rounded-xl">
              <div className="absolute -top-3 left-6 bg-skirting-amber text-skirting-dark text-xs font-bold uppercase tracking-wider px-3 py-1 rounded">
                Recommended
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-skirting-silver mb-4 sm:mb-6">Professional Installation</h3>
              <p className="text-skirting-silver/60 mb-4 sm:mb-6 text-sm sm:text-base">
                Let our certified technicians handle everything for a flawless finish.
              </p>
              <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                {[
                  "Site survey included",
                  "Certified technicians",
                  "Same-day installation",
                  "5-year workmanship warranty",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-skirting-silver/80 text-sm sm:text-base">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-skirting-amber shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex items-baseline gap-2 mb-4 sm:mb-6">
                <span className="text-2xl sm:text-3xl font-bold text-skirting-amber">$45</span>
                <span className="text-skirting-silver/60 text-sm sm:text-base">/meter installed</span>
              </div>
              <Link
                href="/contact"
                className="block w-full py-3 sm:py-4 bg-skirting-amber text-skirting-dark font-semibold uppercase tracking-wide hover:bg-white transition-colors text-center text-sm sm:text-base rounded-lg"
              >
                Request Quote
              </Link>
            </div>

            {/* DIY Installation */}
            <div className="bg-skirting-dark border border-skirting-silver/20 p-6 sm:p-8 rounded-xl">
              <h3 className="text-xl sm:text-2xl font-bold text-skirting-silver mb-4 sm:mb-6">DIY Installation</h3>
              <p className="text-skirting-silver/60 mb-4 sm:mb-6 text-sm sm:text-base">
                Easy click-fit system designed for confident DIY enthusiasts.
              </p>
              <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                {["Click-fit system", "Video tutorials", "Support hotline", "All tools included"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-skirting-silver/80 text-sm sm:text-base">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-skirting-amber shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex items-baseline gap-2 mb-4 sm:mb-6">
                <span className="text-2xl sm:text-3xl font-bold text-skirting-silver">$29</span>
                <span className="text-skirting-silver/60 text-sm sm:text-base">/installation kit</span>
              </div>
              <Link
                href="/products"
                className="block w-full py-3 sm:py-4 border border-skirting-silver/30 text-skirting-silver font-semibold uppercase tracking-wide hover:border-skirting-amber hover:text-skirting-amber transition-colors text-center text-sm sm:text-base rounded-lg"
              >
                Shop Products
              </Link>
            </div>
          </div>

          {/* Installation Steps */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {[
              { step: "1", title: "Measure", desc: "Calculate total length" },
              { step: "2", title: "Prepare", desc: "Clean wall surface" },
              { step: "3", title: "Mount", desc: "Click-fit to wall" },
              { step: "4", title: "Connect", desc: "Plug in power" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-skirting-amber/10 text-skirting-amber rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-lg sm:text-xl font-bold">
                  {item.step}
                </div>
                <h4 className="text-skirting-silver font-semibold text-sm sm:text-base mb-1 sm:mb-2">{item.title}</h4>
                <p className="text-skirting-silver/50 text-xs sm:text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
