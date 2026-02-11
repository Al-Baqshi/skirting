"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useMemo, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CheckoutModal } from "@/components/checkout-modal"
import type { StorefrontProduct } from "@/lib/supabase-products"

const ledPresence = ["All", "With LED", "Without LED"]
const heights = ["All", "4cm", "6cm", "8cm", "26cm", "30cm", "50cm"]

export default function ProductsPage() {
  const [products, setProducts] = useState<StorefrontProduct[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    led: "All",
    height: "All",
    search: "",
  })

  const [cart, setCart] = useState<{ id: string; quantity: number; length: number }[]>([])
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [lengths, setLengths] = useState<Record<string, number>>({})
  const [imageIndexes, setImageIndexes] = useState<Record<string, number>>({})
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc" | "name">("name")
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        setLoadError(null)
        const res = await fetch("/api/products")
        const json = (await res.json()) as { products?: StorefrontProduct[]; error?: string }

        if (!res.ok) {
          throw new Error(json.error || `Failed to load products: ${res.status}`)
        }

        setProducts(json.products ?? [])
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error"
        setLoadError(message)
        setProducts([])
      }
    }

    load()
  }, [])

  // Filter products
  const filteredProducts = useMemo(() => {
    const result = products.filter((product) => {
      if (filters.led !== "All") {
        const productHasLed = product.ledType?.toLowerCase() !== "without led"
        if ((filters.led === "With LED" && !productHasLed) || (filters.led === "Without LED" && productHasLed)) {
          return false
        }
      }
      if (filters.height !== "All") {
        const opts =
          product.heightOptions && product.heightOptions.length > 0
            ? product.heightOptions
            : product.heightValue
              ? [product.heightValue]
              : [40, 60, 80, 260, 300, 500]
        const filterVal = filters.height === "4cm" ? 40 : filters.height === "6cm" ? 60 : filters.height === "8cm" ? 80 : filters.height === "26cm" ? 260 : filters.height === "30cm" ? 300 : filters.height === "50cm" ? 500 : null
        if (filterVal !== null && !opts.includes(filterVal)) return false
      }
      if (filters.search && !product.name.toLowerCase().includes(filters.search.toLowerCase())) return false
      return true
    })

    // Sort
    if (sortBy === "price-asc") result.sort((a, b) => a.price - b.price)
    else if (sortBy === "price-desc") result.sort((a, b) => b.price - a.price)
    else result.sort((a, b) => a.name.localeCompare(b.name))

    return result
  }, [filters, sortBy, products])

  const addToCart = (productId: string, height = 80) => {
    const qty = quantities[productId] || 1
    const len = lengths[productId] || 1
    setCart((prev) => {
      const existing = prev.find((item) => item.id === productId)
      if (existing) {
        return prev.map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity + qty, length: len, height } : item,
        )
      }
      return [...prev, { id: productId, quantity: qty, length: len, height }]
    })
  }

  const getProductImages = (product: StorefrontProduct) => {
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images
    }
    return product.image ? [product.image] : []
  }

  const nextImage = (productId: string, total: number) => {
    setImageIndexes((prev) => ({
      ...prev,
      [productId]: ((prev[productId] ?? 0) + 1) % total,
    }))
  }

  const prevImage = (productId: string, total: number) => {
    setImageIndexes((prev) => ({
      ...prev,
      [productId]: ((prev[productId] ?? 0) - 1 + total) % total,
    }))
  }

  const cartTotal = cart.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.id)
    return sum + (product?.price || 0) * item.length * item.quantity
  }, 0)

  const clearFilters = () => {
    setFilters({
      led: "All",
      height: "All",
      search: "",
    })
  }

  const activeFilterCount = (filters.led !== "All" ? 1 : 0) + (filters.height !== "All" ? 1 : 0) + (filters.search ? 1 : 0)

  return (
    <div className="min-h-screen bg-skirting-dark">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white tracking-tight mb-2">
            Premium Skirting Boards in New Zealand
          </h1>
          <p className="text-skirting-silver/70">
            Browse our complete range of premium aluminium skirting boards. Best prices, highest quality. New Zealand's skirting specialists.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="lg:hidden flex items-center justify-between w-full bg-skirting-charcoal border border-white/10 rounded-xl px-4 py-3"
          >
            <span className="text-white font-medium flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
                />
              </svg>
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-skirting-amber text-skirting-dark text-xs px-2 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </span>
            <svg
              className={`w-5 h-5 text-skirting-silver transition-transform ${mobileFiltersOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Sidebar Filters */}
          <aside className={`lg:w-72 shrink-0 ${mobileFiltersOpen ? "block" : "hidden lg:block"}`}>
            <div className="bg-skirting-charcoal border border-white/10 rounded-2xl p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-semibold text-lg">Filters</h2>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-skirting-amber text-sm hover:text-white transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="text-skirting-silver text-sm mb-2 block">Search</label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                  placeholder="Search products..."
                  className="w-full bg-skirting-dark border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-skirting-silver/40 focus:border-skirting-amber focus:outline-none transition-colors text-sm"
                />
              </div>

              {/* LED Presence */}
              <div className="mb-6">
                <label className="text-skirting-silver text-sm mb-3 block">LED</label>
                <div className="space-y-2">
                  {ledPresence.map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilters((prev) => ({ ...prev, led: type }))}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between ${
                        filters.led === type
                          ? "bg-skirting-amber/10 text-skirting-amber border border-skirting-amber/30"
                          : "bg-skirting-dark text-skirting-silver hover:bg-white/5"
                      }`}
                    >
                      {type}
                      {filters.led === type && (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Height */}
              <div className="mb-6">
                <label className="text-skirting-silver text-sm mb-3 block">Height</label>
                <select
                  value={filters.height}
                  onChange={(e) => setFilters((prev) => ({ ...prev, height: e.target.value }))}
                  className="w-full bg-skirting-dark border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-skirting-amber focus:outline-none transition-colors text-sm"
                >
                  {heights.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-skirting-silver/70 text-xs">Simple filters: choose height or LED presence.</div>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            {loadError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-200 rounded-2xl p-4 mb-6">
                {loadError}
              </div>
            )}
            {/* Sort & Results */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <p className="text-skirting-silver">
                Showing <span className="text-white font-medium">{filteredProducts.length}</span> products
              </p>
              <div className="flex items-center gap-2">
                <span className="text-skirting-silver text-sm">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="bg-skirting-charcoal border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-skirting-amber focus:outline-none"
                >
                  <option value="name">Name</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Products */}
            {filteredProducts.length === 0 ? (
              <div className="bg-skirting-charcoal border border-white/10 rounded-2xl p-12 text-center">
                <svg
                  className="w-16 h-16 text-skirting-silver/30 mx-auto mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-white text-xl font-semibold mb-2">No products found</h3>
                <p className="text-skirting-silver/70 mb-4">
                  Try adjusting your filters to find what you are looking for.
                </p>
                <button onClick={clearFilters} className="text-skirting-amber hover:text-white transition-colors">
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-skirting-charcoal border border-white/10 rounded-2xl overflow-hidden group hover:border-skirting-amber/50 transition-all duration-300"
                  >
                  <div className="relative aspect-4/3 overflow-hidden">
                      <Link href={`/products/${product.slug}`} className="block">
                        <div className="relative aspect-4/3 overflow-hidden cursor-pointer">
                          {(() => {
                            const images = getProductImages(product)
                            const currentIndex = imageIndexes[product.id] ?? 0
                            const currentImage = images[currentIndex]

                            return (
                              <Image
                                src={(currentImage && (currentImage.startsWith("/") || currentImage.startsWith("http")) ? currentImage : "/placeholder.svg")}
                                alt={product.name}
                                fill
                                sizes="(max-width: 768px) 100vw, 400px"
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                unoptimized={currentImage?.startsWith("http") ?? false}
                              />
                            )
                          })()}
                          <div className="absolute top-3 right-3 bg-skirting-amber text-skirting-dark px-2 py-1 text-xs uppercase tracking-wider font-medium rounded">
                            {product.ledType?.toLowerCase() === "without led" ? "Without LED" : "With LED"}
                          </div>
                          <div className="absolute top-3 left-3 bg-skirting-dark/80 text-white px-2 py-1 text-xs uppercase tracking-wider rounded">
                            {product.category}
                          </div>
                        </div>
                      </Link>

                      {(() => {
                        const images = getProductImages(product)
                        const total = images.length
                        if (total <= 1) return null

                        return (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                prevImage(product.id, total)
                              }}
                              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                              aria-label="Previous image"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                nextImage(product.id, total)
                              }}
                              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                              aria-label="Next image"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs">
                              {(imageIndexes[product.id] ?? 0) + 1} / {total}
                            </div>
                          </>
                        )
                      })()}
                    </div>
                    <div className="p-5">
                      <Link href={`/products/${product.slug}`} className="block mb-2">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-white hover:text-skirting-amber transition-colors cursor-pointer">{product.name}</h3>
                        <span className="text-xl font-semibold text-skirting-amber shrink-0">
                          ${product.price}
                          <span className="text-xs font-light text-skirting-silver">/m</span>
                        </span>
                        </div>
                        <p className="text-skirting-silver/60 text-sm mb-3">{product.description}</p>
                      </Link>

                      <div className="flex flex-wrap gap-1.5 mb-3 text-xs text-skirting-silver/60">
                        <span className="bg-white/5 px-2 py-0.5 rounded">{product.height}</span>
                      </div>

                      {/* Controls */}
                      <div className="flex gap-2 mb-4">
                        <div className="flex-1">
                          <label className="text-skirting-silver/60 text-xs mb-1 block">Length (m)</label>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={lengths[product.id] || 1}
                            onChange={(e) => setLengths((prev) => ({ ...prev, [product.id]: Number(e.target.value) }))}
                            className="w-full bg-skirting-dark border border-white/10 rounded-lg px-3 py-2 text-white text-center text-sm focus:border-skirting-amber focus:outline-none"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-skirting-silver/60 text-xs mb-1 block">Qty</label>
                          <div className="flex items-center border border-white/10 rounded-lg overflow-hidden bg-skirting-dark">
                            <button
                              onClick={() =>
                                setQuantities((prev) => ({
                                  ...prev,
                                  [product.id]: Math.max(1, (prev[product.id] || 1) - 1),
                                }))
                              }
                              className="px-3 py-2 text-skirting-silver hover:bg-white/5 transition-colors text-sm"
                            >
                              -
                            </button>
                            <span className="flex-1 text-center text-white font-medium text-sm">
                              {quantities[product.id] || 1}
                            </span>
                            <button
                              onClick={() =>
                                setQuantities((prev) => ({ ...prev, [product.id]: (prev[product.id] || 1) + 1 }))
                              }
                              className="px-3 py-2 text-skirting-silver hover:bg-white/5 transition-colors text-sm"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <div>
                          <span className="text-skirting-silver/60 text-xs block">Subtotal</span>
                          <span className="text-lg font-semibold text-white">
                            $
                            {(
                              product.price *
                              (lengths[product.id] || 1) *
                              (quantities[product.id] || 1)
                            ).toLocaleString()}
                          </span>
                        </div>
                        <button
                          onClick={() => addToCart(product.id)}
                          className="bg-skirting-amber text-skirting-dark px-4 py-2 text-sm uppercase tracking-wider font-medium hover:bg-white transition-colors rounded-lg"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Floating Cart */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setCheckoutOpen(true)}
            className="bg-skirting-amber text-skirting-dark px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 hover:bg-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <div className="text-left">
              <p className="text-xs opacity-70">{cart.reduce((sum, item) => sum + item.quantity, 0)} items</p>
              <p className="font-bold text-lg">${cartTotal.toLocaleString()}</p>
            </div>
            <span className="bg-skirting-dark text-white px-4 py-2 rounded-lg text-sm font-medium">Checkout</span>
          </button>
        </div>
      )}

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cart={cart}
        products={products}
        quantities={quantities}
        lengths={lengths}
        onUpdateCart={(updatedCart) => {
          setCart(updatedCart)
          // Update quantities and lengths to match
          const newQuantities: Record<string, number> = {}
          const newLengths: Record<string, number> = {}
          updatedCart.forEach((item) => {
            newQuantities[item.id] = item.quantity
            newLengths[item.id] = item.length
          })
          setQuantities(newQuantities)
          setLengths(newLengths)
        }}
        onClearCart={() => {
          setCart([])
          setQuantities({})
          setLengths({})
        }}
      />
      <Footer />
    </div>
  )
}
