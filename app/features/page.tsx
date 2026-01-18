import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Link } from "lucide-react"

export const metadata: Metadata = {
  title: "Skirting Features NZ | LED Skirting, Smart Skirting & More",
  description:
    "Discover premium skirting features - LED skirting boards, smart WiFi control, aluminium construction & 5-year warranty. New Zealand's only specialized skirting company.",
  keywords: [
    "skirting features NZ",
    "LED skirting NZ",
    "smart skirting New Zealand",
    "skirting boards features",
    "aluminium skirting features",
    "WiFi skirting",
    "dimmable skirting",
    "RGB skirting NZ",
    "skirting with LED lights",
    "modern skirting NZ",
  ],
  openGraph: {
    title: "Skirting Features | Innovation Skirting NZ",
    description: "Premium LED skirting boards with smart control, aluminium construction & 5-year warranty.",
    type: "website",
    locale: "en_NZ",
  },
  alternates: {
    canonical: "https://skirting.co.nz/features",
  },
}

const features = [
  {
    icon: (
      <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
        />
      </svg>
    ),
    title: "Integrated LED",
    description: "Premium LED strips with 50,000+ hours lifespan and energy efficiency. Perfect for New Zealand homes and businesses.",
  },
  {
    icon: (
      <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z"
        />
      </svg>
    ),
    title: "Smart Control",
    description: "WiFi enabled with app and voice assistant support for seamless control. Perfect for modern New Zealand homes.",
  },
  {
    icon: (
      <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
        />
      </svg>
    ),
    title: "Power Options",
    description: "Integrated USB ports and power outlets available on select models. Convenient charging solutions for your devices.",
  },
  {
    icon: (
      <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Motion Sensor",
    description: "Automatic activation with adjustable sensitivity and timing. Energy-efficient lighting that responds to movement.",
  },
  {
    icon: (
      <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Easy Installation",
    description: "Click-fit system for quick professional or DIY installation. Perfect for New Zealand homes and businesses.",
  },
  {
    icon: (
      <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
        />
      </svg>
    ),
    title: "5 Year Warranty",
    description: "Full manufacturer warranty on all products and LED components. Peace of mind for New Zealand customers.",
  },
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-skirting-dark">
      <Header />

      {/* Hero Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-skirting-charcoal to-skirting-dark px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-skirting-amber text-xs sm:text-sm font-bold uppercase tracking-widest">Why Innovation Skirting</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-skirting-silver mt-4 sm:mt-6 tracking-tight">
            New Zealand's Skirting Specialists
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-skirting-silver/70 mt-4 sm:mt-6 max-w-3xl mx-auto">
            As New Zealand's only specialized skirting company, we focus exclusively on skirting boards. Best prices, highest quality, expert knowledge.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 sm:py-16 lg:py-20 bg-skirting-charcoal px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 sm:p-8 bg-skirting-dark/50 border border-skirting-silver/10 hover:border-skirting-amber/50 transition-all duration-300 rounded-xl"
              >
                <div className="text-skirting-amber mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-skirting-silver mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-skirting-silver/60 text-sm sm:text-base leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-skirting-dark px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-skirting-silver mb-4 sm:mb-6">
            Ready to Experience Premium Skirting?
          </h2>
          <p className="text-base sm:text-lg text-skirting-silver/70 mb-8 sm:mb-10">
            Browse our complete range of premium skirting boards. Best prices, highest quality. New Zealand's skirting specialists.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-skirting-amber font-semibold uppercase tracking-wide hover:bg-white transition-colors text-center text-sm sm:text-base rounded-lg"
              style={{ color: "#000000" }}
            >
              View Products
            </Link>
            <Link
              href="/contact"
              className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-skirting-silver/30 font-semibold uppercase tracking-wide hover:border-skirting-amber hover:text-skirting-amber transition-colors text-center text-sm sm:text-base rounded-lg"
              style={{ color: "#ffffff" }}
            >
              Get a Quote
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
