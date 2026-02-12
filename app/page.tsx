"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import type { StorefrontProduct } from "@/lib/supabase-products"

export default function Page() {
  const [ledOn, setLedOn] = useState(true)
  const [products, setProducts] = useState<StorefrontProduct[]>([])
  const [productsError, setProductsError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setProductsError(null)
        const res = await fetch("/api/products")
        const json = (await res.json()) as { products?: StorefrontProduct[]; error?: string }

        if (!res.ok) {
          throw new Error(json.error || `Failed to load products: ${res.status}`)
        }

        setProducts((json.products ?? []).slice(0, 4))
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error"
        setProductsError(message)
        setProducts([])
      }
    }

    load()
  }, [])

  return (
    <div className="min-h-screen bg-skirting-dark">
      <Header />

      {/* Hero Section */}
      <section className="min-h-[calc(100vh-5rem)] flex items-center justify-center relative bg-gradient-to-br from-skirting-charcoal to-skirting-dark px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 100px, rgba(255,255,255,0.03) 100px, rgba(255,255,255,0.03) 101px)`,
            }}
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center max-w-6xl mx-auto w-full">
          {/* Animated Skirting SVG */}
          <div className="w-full max-w-4xl mb-6 sm:mb-8 md:mb-12">
            <svg viewBox="0 0 800 120" className="w-full h-auto">
              <defs>
                <linearGradient id="aluminium" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#5a5e63" />
                  <stop offset="30%" stopColor="#8a8f95" />
                  <stop offset="50%" stopColor="#d3d6da" />
                  <stop offset="70%" stopColor="#8a8f95" />
                  <stop offset="100%" stopColor="#5a5e63" />
                </linearGradient>
                <linearGradient id="led-gradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ff9f1c" />
                  <stop offset="50%" stopColor="#ffcc66" />
                  <stop offset="100%" stopColor="#ff9f1c" />
                </linearGradient>
                <filter id="led-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <rect x="50" y="20" width="700" height="60" fill="url(#aluminium)" rx="2" />
              <rect x="50" y="20" width="700" height="3" fill="#e8eaed" opacity="0.8" />
              <rect x="50" y="75" width="700" height="8" fill="#2a2a2a" />
              <rect
                x="50"
                y="75"
                width="700"
                height="8"
                fill={ledOn ? "url(#led-gradient)" : "#333"}
                filter={ledOn ? "url(#led-glow)" : "none"}
                className="transition-all duration-500"
                opacity={ledOn ? 1 : 0.3}
              />
              {ledOn && <ellipse cx="400" cy="110" rx="350" ry="15" fill="url(#led-gradient)" opacity="0.3" />}
              <rect x="50" y="83" width="700" height="4" fill="#4a4e53" />
            </svg>
          </div>

          {/* LED Toggle */}
          <button
            onClick={() => setLedOn(!ledOn)}
            className={`mb-6 sm:mb-8 flex items-center gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-full border-2 transition-all duration-300 ${
              ledOn
                ? "border-skirting-amber bg-skirting-amber/10 text-skirting-amber"
                : "border-skirting-silver/30 bg-skirting-charcoal text-skirting-silver/60"
            }`}
          >
            <div
              className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300 ${
                ledOn ? "bg-skirting-amber shadow-lg shadow-skirting-amber/50" : "bg-skirting-silver/30"
              }`}
            />
            <span className="text-xs sm:text-sm font-medium uppercase tracking-wider">{ledOn ? "LED On" : "LED Off"}</span>
          </button>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-center text-skirting-silver tracking-tight mb-3 sm:mb-4">
            New Zealand's <span className="text-skirting-amber">#1 Skirting</span> Specialist
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-skirting-silver/70 text-center max-w-2xl mb-4 sm:mb-6 px-4">
            Innovation Skirting - New Zealand's only specialized skirting company. Best prices, highest quality LED skirting boards. <strong className="text-skirting-amber">Skirting boards only.</strong>
          </p>
          <p className="text-sm sm:text-base md:text-lg text-skirting-silver/60 text-center max-w-2xl mb-8 sm:mb-10 px-4">
            Premium aluminium skirting boards with integrated LED lighting. Transform any room with innovative base solutions.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
            <Link
              href="/products"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-skirting-amber text-skirting-dark font-semibold uppercase tracking-wide hover:bg-white transition-colors text-center text-sm sm:text-base"
            >
              Explore Products
            </Link>
            <Link
              href="/features"
              className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-skirting-silver/30 text-skirting-silver font-semibold uppercase tracking-wide hover:border-skirting-amber hover:text-skirting-amber transition-colors text-center text-sm sm:text-base"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Navigation Cards */}
      <section className="py-12 sm:py-16 lg:py-20 bg-skirting-charcoal px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <span className="text-skirting-amber text-xs sm:text-sm font-bold uppercase tracking-widest">Explore</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-skirting-silver mt-3 sm:mt-4 tracking-tight">
              Discover Our Skirting Boards
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Link
              href="/features"
              className="group bg-skirting-dark border border-skirting-silver/10 hover:border-skirting-amber/50 transition-all duration-300 p-6 sm:p-8 rounded-xl"
            >
              <div className="text-skirting-amber mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-skirting-silver mb-2">Features</h3>
              <p className="text-skirting-silver/60 text-sm sm:text-base leading-relaxed">Discover why Innovation Skirting is New Zealand's skirting specialist</p>
            </Link>

            <Link
              href="/products"
              className="group bg-skirting-dark border border-skirting-silver/10 hover:border-skirting-amber/50 transition-all duration-300 p-6 sm:p-8 rounded-xl"
            >
              <div className="text-skirting-amber mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.75 7.5l3-3m0 0l3 3m-3-3v12" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-skirting-silver mb-2">Products</h3>
              <p className="text-skirting-silver/60 text-sm sm:text-base leading-relaxed">Browse our premium skirting boards - best prices in New Zealand</p>
            </Link>

            <Link
              href="/installation"
              className="group bg-skirting-dark border border-skirting-silver/10 hover:border-skirting-amber/50 transition-all duration-300 p-6 sm:p-8 rounded-xl"
            >
              <div className="text-skirting-amber mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-2.515 2.853a2.548 2.548 0 11-3.586-3.586l2.853-2.515z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-skirting-silver mb-2">Installation</h3>
              <p className="text-skirting-silver/60 text-sm sm:text-base leading-relaxed">Professional or DIY skirting board installation nationwide</p>
            </Link>

            <Link
              href="/contact"
              className="group bg-skirting-dark border border-skirting-silver/10 hover:border-skirting-amber/50 transition-all duration-300 p-6 sm:p-8 rounded-xl"
            >
              <div className="text-skirting-amber mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-skirting-silver mb-2">Contact</h3>
              <p className="text-skirting-silver/60 text-sm sm:text-base leading-relaxed">Get in touch for skirting quotes and expert advice</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Preview */}
      <section className="py-12 sm:py-16 lg:py-20 bg-skirting-dark px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-10 gap-4">
            <div>
              <span className="text-skirting-amber text-xs sm:text-sm font-bold uppercase tracking-widest">Our Range</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-skirting-silver mt-2 sm:mt-3 tracking-tight">
                Premium Skirting Boards in New Zealand
              </h2>
              <p className="text-skirting-silver/60 text-sm sm:text-base mt-2">
                Best prices, highest quality. New Zealand's skirting specialists.
              </p>
            </div>
            <Link
              href="/products"
              className="text-skirting-amber hover:text-white transition-colors text-sm sm:text-base uppercase tracking-wide flex items-center gap-2"
            >
              View All Products
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group bg-skirting-charcoal border border-skirting-silver/10 hover:border-skirting-amber/30 transition-all duration-300 overflow-hidden rounded-xl"
              >
                <div className="aspect-[4/3] relative overflow-hidden bg-skirting-dark">
                  <Image
                    src={(product.image && (product.image.startsWith("/") || product.image.startsWith("http")) ? product.image : "/placeholder.svg")}
                    alt={`${product.name} - Skirting board NZ`}
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    priority
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized={product.image?.startsWith("http") ?? false}
                  />
                </div>
                <div className="p-4 sm:p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-skirting-silver text-sm sm:text-base">{product.name}</h3>
                    <span className="text-skirting-amber font-bold text-sm sm:text-base">${product.price}/m</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    <span className="text-xs px-2 py-0.5 bg-skirting-amber/10 text-skirting-amber">
                      {product.ledType}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-skirting-silver/10 text-skirting-silver/70">
                      {product.height}
                    </span>
                  </div>
                  <p className="text-skirting-silver/60 text-xs sm:text-sm line-clamp-2">{product.description}</p>
                </div>
              </Link>
            ))}
          </div>

          {productsError && (
            <div className="mt-6 text-skirting-silver/60 text-sm">
              {productsError}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
