"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { toast } from "sonner"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CheckoutModal } from "@/components/checkout-modal"
import { getProductSectionLabels5, getProductCatalogEntry, getDisplayColors, type ProductCatalogEntry } from "@/lib/product-catalog"
import { getPriceForHeight, type StorefrontProduct } from "@/lib/supabase-products"

type Props = {
  product: StorefrontProduct
  allProducts: StorefrontProduct[]
  catalogEntry: ProductCatalogEntry | null
}

export function ProductViewClient({ product, allProducts, catalogEntry }: Props) {
  const heightOpts = product.heightOptions && product.heightOptions.length > 0
    ? product.heightOptions.sort((a, b) => a - b)
    : [12, 20, 30, 40, 46, 50, 60, 65, 70, 80, 90, 100, 260]
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const MIN_ORDER_METERS = 1
  const DEFAULT_LENGTH_M = 50
  const SHOW_PRICE = false
  const [length, setLength] = useState(DEFAULT_LENGTH_M)
  const [height, setHeight] = useState<number>(heightOpts[0] ?? 50)
  const displayColors = getDisplayColors(product)
  const [selectedColor, setSelectedColor] = useState<string>(() => displayColors[0] ?? "")
  const [cart, setCart] = useState<{ id: string; quantity: number; length: number; height?: number; color?: string }[]>([])
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [lengths, setLengths] = useState<Record<string, number>>({})

  const rawImages =
    product.images && Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : []
  const allImages = rawImages.filter((u) => u && String(u).trim())
  const slotImages = [
    rawImages[0] || "",
    rawImages[1] || "",
    rawImages[2] || "",
    rawImages[3] || "",
    rawImages[4] || "",
  ]

  const useStructuredView = catalogEntry && allImages.length >= 1
  const sectionLabels5 = getProductSectionLabels5(product.slug)
  const displayName = catalogEntry?.displayName ?? product.name

  const currentIndex = allProducts.findIndex((p) => p.id === product.id)
  const prevProduct = currentIndex > 0 ? allProducts[currentIndex - 1] : null
  const nextProduct = currentIndex >= 0 && currentIndex < allProducts.length - 1 ? allProducts[currentIndex + 1] : null

  const addToCart = () => {
    const qty = 1
    const len = length
    const h = height
    const colorToUse = displayColors.length ? selectedColor || displayColors[0] : undefined
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        const updated = prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + qty, length: len, height: h, color: colorToUse } : item,
        )
        toast.success("Added to cart!")
        return updated
      }
      toast.success(`${product.name} added to cart!`)
      return [...prev, { id: product.id, quantity: qty, length: len, height: h, color: colorToUse }]
    })
    setQuantities((prev) => ({ ...prev, [product.id]: qty }))
    setLengths((prev) => ({ ...prev, [product.id]: len }))
  }

  const pricePerMeter = getPriceForHeight(product, height)
  const subtotal = pricePerMeter * length * quantity
  const cartProducts = [product, ...allProducts.filter((p) => p.id !== product.id)]
  const cartTotal = cart.reduce((sum, item) => {
    const p = cartProducts.find((pr) => pr.id === item.id)
    const unitPrice = p ? getPriceForHeight(p, item.height ?? p.heightOptions?.[0] ?? 50) : 0
    return sum + unitPrice * item.length * item.quantity
  }, 0)

  return (
    <div className="min-h-screen bg-skirting-dark">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb */}
        <div className="mb-6 sm:mb-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-skirting-amber hover:text-white transition-colors text-sm"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Products
          </Link>
        </div>

        {useStructuredView ? (
          /* ——— 5-section product view (Main, Parameters, Installation, Accessories, Colours) ——— */
          <div className="space-y-12 sm:space-y-16">
            {/* Hero: name, code, price, short description */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-6 border-b border-white/10">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-skirting-amber/20 text-skirting-amber text-xs uppercase tracking-wider rounded">
                    {product.category}
                  </span>
                  {catalogEntry && (
                    <span className="text-skirting-silver/70 text-sm">
                      {catalogEntry.internalCode}
                      {catalogEntry.catalogueLine && ` · ${catalogEntry.catalogueLine}`}
                    </span>
                  )}
                  {product.inStock ? (
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs uppercase tracking-wider rounded">
                      In Stock
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs uppercase tracking-wider rounded">
                      Out of Stock
                    </span>
                  )}
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-3">
                  {displayName}
                </h1>
                <p className="text-skirting-silver/70 max-w-xl">{product.description}</p>
              </div>
              {SHOW_PRICE && (
                <div className="flex items-baseline gap-2 shrink-0">
                  <span className="text-3xl sm:text-4xl font-bold text-skirting-amber">${pricePerMeter}</span>
                  <span className="text-skirting-silver/60 text-sm sm:text-base">per meter</span>
                </div>
              )}
            </div>

            {/* Sections 1–5: Main, Parameters, Installation, Accessories, Colours */}
            {sectionLabels5.map((label, index) => (
              <section key={index} className="scroll-mt-24">
                <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">{label}</h2>
                <div className="relative aspect-4/3 sm:aspect-video bg-skirting-charcoal rounded-2xl overflow-hidden">
                  <Image
                    src={slotImages[index] || "/placeholder.svg"}
                    alt={slotImages[index] ? `${displayName} – ${label}` : `Placeholder – ${label}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 800px"
                    className="object-contain"
                    priority={index === 0}
                    unoptimized={slotImages[index]?.startsWith("http") ?? false}
                  />
                </div>
                {index === 1 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {product.height && (
                      <div className="bg-skirting-charcoal border border-white/10 rounded-lg p-3">
                        <span className="text-skirting-silver/60 text-xs block">Height</span>
                        <p className="text-white font-medium">{product.height}</p>
                      </div>
                    )}
                    {product.ledType && (
                      <div className="bg-skirting-charcoal border border-white/10 rounded-lg p-3">
                        <span className="text-skirting-silver/60 text-xs block">LED</span>
                        <p className="text-white font-medium">{product.ledType}</p>
                      </div>
                    )}
                    {product.profile && (
                      <div className="bg-skirting-charcoal border border-white/10 rounded-lg p-3">
                        <span className="text-skirting-silver/60 text-xs block">Profile</span>
                        <p className="text-white font-medium">{product.profile}</p>
                      </div>
                    )}
                    {product.power && (
                      <div className="bg-skirting-charcoal border border-white/10 rounded-lg p-3">
                        <span className="text-skirting-silver/60 text-xs block">Power</span>
                        <p className="text-white font-medium">{product.power}</p>
                      </div>
                    )}
                    {displayColors.length > 0 && (
                      <div className="bg-skirting-charcoal border border-white/10 rounded-lg p-3 col-span-2 sm:col-span-4">
                        <span className="text-skirting-silver/60 text-xs block">Colours</span>
                        <p className="text-white font-medium">{displayColors.join(", ")}</p>
                      </div>
                    )}
                  </div>
                )}
              </section>
            ))}

            {/* Order card — sticky on desktop for easy access */}
            <div className="lg:sticky lg:top-24">
              <div className="bg-skirting-charcoal border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Order {displayName}</h3>
                <p className="text-skirting-silver/70 text-sm mb-6">
                  Best prices, highest quality. New Zealand&apos;s only specialized skirting company.
                </p>
                {heightOpts.length > 1 && (
                  <div className="mb-4">
                    <label className="text-skirting-silver/60 text-xs mb-1 block">Height</label>
                    <div className="flex flex-wrap gap-2">
                      {heightOpts.map((h) => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => setHeight(h)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            height === h
                              ? "bg-skirting-amber text-skirting-dark"
                              : "bg-skirting-charcoal border border-white/10 text-skirting-silver hover:border-skirting-amber/50"
                          }`}
                        >
                          {h / 10}cm
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <label className="text-skirting-silver/60 text-xs mb-1 block">Length (m)</label>
                    <input
                      type="number"
                      min={MIN_ORDER_METERS}
                      max={10000}
                      value={length}
                      onChange={(e) => setLength(Math.max(MIN_ORDER_METERS, Number(e.target.value) || MIN_ORDER_METERS))}
                      className="w-full bg-skirting-dark border border-white/10 rounded-lg px-3 py-2.5 text-white text-center text-base focus:border-skirting-amber focus:outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-skirting-silver/60 text-xs mb-1 block">Colour</label>
                    {displayColors.length > 0 ? (
                      <select
                        value={selectedColor || displayColors[0]}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="w-full h-[42px] bg-skirting-dark border border-white/10 rounded-lg pl-3 pr-8 py-2.5 text-white text-sm focus:border-skirting-amber focus:outline-none appearance-none cursor-pointer"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239ca3af' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
                      >
                        {displayColors.map((c) => (
                          <option key={c} value={c} className="bg-skirting-dark text-white">
                            {c}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex items-center justify-center h-[42px] rounded-lg border border-white/10 bg-skirting-dark text-skirting-silver/50 text-sm">
                        —
                      </div>
                    )}
                  </div>
                </div>
                <div className="pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={addToCart}
                    className="w-full bg-skirting-amber text-skirting-dark px-6 py-3 text-sm uppercase tracking-wider font-medium hover:bg-white transition-colors rounded-lg"
                  >
                    Add to Cart
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setCheckoutOpen(true)}
                    className="flex-1 px-4 py-3 border border-white/20 text-skirting-silver font-medium text-center rounded-lg hover:border-skirting-amber hover:text-skirting-amber transition-colors text-sm"
                  >
                    Checkout
                  </button>
                  <Link
                    href="/products"
                    className="flex-1 px-4 py-3 border border-white/20 text-skirting-silver font-medium text-center rounded-lg hover:border-skirting-amber hover:text-skirting-amber transition-colors text-sm"
                  >
                    View All Products
                  </Link>
                </div>
              </div>
            </div>

            {/* Navigate other products */}
            <nav className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-8 border-t border-white/10">
              {prevProduct ? (
                <Link
                  href={`/products/${prevProduct.slug}`}
                  className="flex items-center gap-2 text-skirting-amber hover:text-white transition-colors text-sm font-medium"
                >
                  <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  {prevProduct.name}
                </Link>
              ) : (
                <span />
              )}
              <Link
                href="/products"
                className="text-skirting-silver hover:text-white transition-colors text-sm font-medium text-center"
              >
                All products
              </Link>
              {nextProduct ? (
                <Link
                  href={`/products/${nextProduct.slug}`}
                  className="flex items-center gap-2 text-skirting-amber hover:text-white transition-colors text-sm font-medium sm:ml-auto"
                >
                  {nextProduct.name}
                  <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ) : (
                <span />
              )}
            </nav>
          </div>
        ) : (
          /* ——— Legacy single-gallery + specs view ——— */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="relative aspect-square bg-skirting-charcoal rounded-2xl overflow-hidden group">
                {allImages.length > 0 && allImages[currentImageIndex] ? (
                  <>
                    <Image
                      src={allImages[currentImageIndex]}
                      alt={`${product.name} – ${currentImageIndex + 1}`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 800px"
                      className="object-cover transition-opacity duration-500"
                      priority
                      unoptimized={allImages[currentImageIndex].startsWith("http")}
                      key={currentImageIndex}
                    />
                    {allImages.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
                          }
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                          aria-label="Previous image"
                        >
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                          aria-label="Next image"
                        >
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                          {currentImageIndex + 1} / {allImages.length}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <Image
                    src="/placeholder.svg"
                    alt="Placeholder"
                    fill
                    sizes="(max-width: 1024px) 100vw, 800px"
                    className="object-contain"
                  />
                )}
              </div>
              {allImages.length > 1 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {allImages.map((img: string, index: number) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        currentImageIndex === index
                          ? "border-skirting-amber ring-2 ring-skirting-amber/50"
                          : "border-white/10 hover:border-skirting-amber/50"
                      }`}
                    >
                      <Image
                        src={img}
                        alt=""
                        fill
                        sizes="120px"
                        className="object-cover"
                        unoptimized={img.startsWith("http")}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-skirting-amber/20 text-skirting-amber text-xs uppercase tracking-wider rounded">
                  {product.category}
                </span>
                {product.inStock ? (
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs uppercase tracking-wider rounded">
                    In Stock
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs uppercase tracking-wider rounded">
                    Out of Stock
                  </span>
                )}
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">{product.name}</h1>
              {SHOW_PRICE && (
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-4xl font-bold text-skirting-amber">${pricePerMeter}</span>
                  <span className="text-skirting-silver/60">per meter</span>
                </div>
              )}
              <p className="text-lg text-skirting-silver/70 leading-relaxed mb-6">{product.description}</p>

              <div className="bg-skirting-charcoal border border-white/10 rounded-xl p-6 mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">Specifications</h2>
                <div className="grid grid-cols-2 gap-4">
                  {product.ledType && (
                    <div>
                      <span className="text-skirting-silver/60 text-sm">LED Type</span>
                      <p className="text-white font-medium">{product.ledType}</p>
                    </div>
                  )}
                  {product.height && (
                    <div>
                      <span className="text-skirting-silver/60 text-sm">Height</span>
                      <p className="text-white font-medium">{product.height}</p>
                    </div>
                  )}
                  {displayColors.length > 0 && (
                    <div>
                      <span className="text-skirting-silver/60 text-sm">Colours</span>
                      <p className="text-white font-medium">{displayColors.join(", ")}</p>
                    </div>
                  )}
                  {product.profile && (
                    <div>
                      <span className="text-skirting-silver/60 text-sm">Profile</span>
                      <p className="text-white font-medium">{product.profile}</p>
                    </div>
                  )}
                  {product.power && (
                    <div>
                      <span className="text-skirting-silver/60 text-sm">Power</span>
                      <p className="text-white font-medium">{product.power}</p>
                    </div>
                  )}
                </div>
              </div>

              {product.features && product.features.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Features</h2>
                  <div className="flex flex-wrap gap-2">
                    {product.features.map((feature: string, index: number) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-skirting-amber/10 text-skirting-amber rounded-full text-sm"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-skirting-charcoal border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Order</h3>
                {heightOpts.length > 1 && (
                  <div className="mb-4">
                    <label className="text-skirting-silver/60 text-xs mb-1 block">Height</label>
                    <div className="flex flex-wrap gap-2">
                      {heightOpts.map((h) => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => setHeight(h)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            height === h
                              ? "bg-skirting-amber text-skirting-dark"
                              : "bg-skirting-dark border border-white/10 text-skirting-silver hover:border-skirting-amber/50"
                          }`}
                        >
                          {h / 10}cm
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-2 mb-4">
                  <div className="flex-1">
                    <label className="text-skirting-silver/60 text-xs mb-1 block">Length (m)</label>
                    <input
                      type="number"
                      min={MIN_ORDER_METERS}
                      max={10000}
                      value={length}
                      onChange={(e) => setLength(Math.max(MIN_ORDER_METERS, Number(e.target.value) || MIN_ORDER_METERS))}
                      className="w-full bg-skirting-dark border border-white/10 rounded-lg px-3 py-2 text-white text-center text-sm focus:border-skirting-amber focus:outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-skirting-silver/60 text-xs mb-1 block">Colour</label>
                    {displayColors.length > 0 ? (
                      <select
                        value={selectedColor || displayColors[0]}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="w-full h-[38px] bg-skirting-dark border border-white/10 rounded-lg pl-3 pr-8 py-2 text-white text-sm focus:border-skirting-amber focus:outline-none appearance-none cursor-pointer"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239ca3af' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}
                      >
                        {displayColors.map((c) => (
                          <option key={c} value={c} className="bg-skirting-dark text-white">
                            {c}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex items-center justify-center h-[38px] rounded-lg border border-white/10 bg-skirting-dark text-skirting-silver/50 text-xs">
                        —
                      </div>
                    )}
                  </div>
                </div>
                <div className="pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={addToCart}
                    className="w-full bg-skirting-amber text-skirting-dark px-6 py-3 text-sm uppercase tracking-wider font-medium hover:bg-white rounded-lg"
                  >
                    Add to Cart
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 mt-6 pt-6 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setCheckoutOpen(true)}
                    className="flex-1 px-6 py-3 border-2 border-skirting-silver/30 text-skirting-silver font-semibold uppercase tracking-wide hover:border-skirting-amber hover:text-skirting-amber text-center rounded-lg"
                  >
                    Checkout
                  </button>
                  <Link
                    href="/products"
                    className="flex-1 px-6 py-3 border-2 border-skirting-silver/30 text-skirting-silver font-semibold uppercase tracking-wide hover:border-skirting-amber hover:text-skirting-amber text-center rounded-lg"
                  >
                    View All Products
                  </Link>
                </div>
              </div>

              {/* Prev/Next */}
              <div className="flex flex-wrap items-center justify-between gap-4 mt-8 pt-8 border-t border-white/10">
                {prevProduct && (
                  <Link
                    href={`/products/${prevProduct.slug}`}
                    className="text-skirting-amber hover:text-white text-sm font-medium flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    {prevProduct.name}
                  </Link>
                )}
                {nextProduct && (
                  <Link
                    href={`/products/${nextProduct.slug}`}
                    className="text-skirting-amber hover:text-white text-sm font-medium flex items-center gap-2 ml-auto"
                  >
                    {nextProduct.name}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SEO block */}
        <div className="mt-12">
          <div className="bg-skirting-charcoal border border-white/10 rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Why choose {displayName} from Innovation Skirting?
            </h2>
            <p className="text-skirting-silver/70 leading-relaxed mb-4">
              As New Zealand&apos;s only specialized skirting company, Innovation Skirting offers the best prices and
              highest quality. The {displayName} is ideal for {product.category} use, with{" "}
              {product.ledType?.toLowerCase() || "premium"} LED and {product.height || "standard"} height.
            </p>
            <p className="text-skirting-silver/70 leading-relaxed">
              Order today — best prices guaranteed, premium materials, and expert installation available.
            </p>
          </div>
        </div>

        {/* Floating cart */}
        {cart.length > 0 && (
          <div className="fixed bottom-6 right-6 z-50">
            <button
              type="button"
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
                {SHOW_PRICE && <p className="font-bold text-lg">${cartTotal.toLocaleString()}</p>}
              </div>
              <span className="bg-skirting-dark text-white px-4 py-2 rounded-lg text-sm font-medium">Checkout</span>
            </button>
          </div>
        )}

        <CheckoutModal
          isOpen={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          cart={cart}
          products={cartProducts}
          quantities={quantities}
          lengths={lengths}
          onUpdateCart={(updatedCart) => {
            setCart(updatedCart)
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
      </div>
      <Footer />
    </div>
  )
}
