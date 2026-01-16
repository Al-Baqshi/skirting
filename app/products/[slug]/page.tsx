"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { toast } from "sonner"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CheckoutModal } from "@/components/checkout-modal"
import { getSupabaseProductBySlug, type StorefrontProduct } from "@/lib/supabase-products"

type Props = {
  params: Promise<{ slug: string }>
}

export default function ProductPage({ params }: Props) {
  const [product, setProduct] = useState<StorefrontProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [length, setLength] = useState(1)
  const [cart, setCart] = useState<{ id: string; quantity: number; length: number }[]>([])
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [lengths, setLengths] = useState<Record<string, number>>({})

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const resolvedParams = await params
        const { slug } = resolvedParams
        
        if (!slug) {
          notFound()
          return
        }
        
        let loadedProduct = await getSupabaseProductBySlug(slug, false)
        if (!loadedProduct) {
          loadedProduct = await getSupabaseProductBySlug(slug, true)
        }

        if (!loadedProduct) {
          notFound()
          return
        }

        setProduct(loadedProduct)
      } catch (error) {
        console.error("Error loading product:", error)
        notFound()
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [params])

  if (loading) {
    return (
      <div className="min-h-screen bg-skirting-dark flex items-center justify-center">
        <div className="text-skirting-silver">Loading...</div>
      </div>
    )
  }

  if (!product) {
    notFound()
  }

  // Get all images - support both old format (single image) and new format (images array)
  const allImages = product.images && Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : product.image
      ? [product.image]
      : []

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
  }

  const addToCart = () => {
    if (!product) return
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        const updated = prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity, length: length } : item,
        )
        toast.success(`Added ${quantity} more to cart!`)
        return updated
      }
      toast.success(`${product.name} added to cart!`)
      return [...prev, { id: product.id, quantity: quantity, length: length }]
    })
    // Update quantities/lengths for checkout
    setQuantities((prev) => ({ ...prev, [product.id]: quantity }))
    setLengths((prev) => ({ ...prev, [product.id]: length }))
  }

  const subtotal = product ? product.price * length * quantity : 0
  const cartTotal = cart.reduce((sum, item) => {
    const itemProduct = product && item.id === product.id ? product : null
    return sum + (itemProduct?.price || 0) * item.length * item.quantity
  }, 0)

  return (
    <div className="min-h-screen bg-skirting-dark">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-skirting-charcoal rounded-2xl overflow-hidden group">
              {allImages.length > 0 && allImages[currentImageIndex] ? (
                <>
                  <Image
                    src={allImages[currentImageIndex]}
                    alt={`${product.name} - Image ${currentImageIndex + 1}`}
                    fill
                    className="object-cover transition-opacity duration-500"
                    priority
                    unoptimized={allImages[currentImageIndex].startsWith("http")}
                    key={currentImageIndex}
                  />
                  {/* Navigation Arrows */}
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110 active:scale-95"
                        aria-label="Previous image"
                      >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110 active:scale-95"
                        aria-label="Next image"
                      >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}
                  {/* Image Counter */}
                  {allImages.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm transition-all duration-300">
                      {currentImageIndex + 1} / {allImages.length}
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-skirting-silver/50">
                  <span>No Image</span>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {allImages.map((img: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300 transform hover:scale-105 ${
                      currentImageIndex === index
                        ? "border-skirting-amber ring-2 ring-skirting-amber/50 scale-105"
                        : "border-white/10 hover:border-skirting-amber/50"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      fill
                      className="object-cover transition-opacity duration-300"
                      unoptimized={img.startsWith("http")}
                    />
                    {currentImageIndex === index && (
                      <div className="absolute inset-0 bg-skirting-amber/10 transition-opacity duration-300" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-skirting-amber hover:text-white transition-colors text-sm mb-6"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Products
            </Link>

            <div className="mb-6">
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
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-4xl font-bold text-skirting-amber">${product.price}</span>
                <span className="text-skirting-silver/60">per meter</span>
              </div>
              <p className="text-lg text-skirting-silver/70 leading-relaxed mb-6">{product.description}</p>
            </div>

            {/* Specifications */}
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
                {product.heightValue && (
                  <div>
                    <span className="text-skirting-silver/60 text-sm">Height Value</span>
                    <p className="text-white font-medium">{product.heightValue}mm</p>
                  </div>
                )}
              </div>
            </div>

            {/* Features */}
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

            {/* Cart Controls */}
            <div className="bg-skirting-charcoal border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Order from New Zealand's Skirting Specialists</h3>
              <p className="text-skirting-silver/70 text-sm mb-6">
                Best prices, highest quality. Innovation Skirting is New Zealand's only specialized skirting company.
              </p>

              {/* Length and Quantity Controls */}
              <div className="flex gap-2 mb-4">
                <div className="flex-1">
                  <label className="text-skirting-silver/60 text-xs mb-1 block">Length (m)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={length}
                    onChange={(e) => setLength(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-skirting-dark border border-white/10 rounded-lg px-3 py-2 text-white text-center text-sm focus:border-skirting-amber focus:outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-skirting-silver/60 text-xs mb-1 block">Qty</label>
                  <div className="flex items-center border border-white/10 rounded-lg overflow-hidden bg-skirting-dark">
                    <button
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      className="px-3 py-2 text-skirting-silver hover:bg-white/5 transition-colors text-sm"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center text-white font-medium text-sm">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((prev) => prev + 1)}
                      className="px-3 py-2 text-skirting-silver hover:bg-white/5 transition-colors text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Subtotal and Add to Cart */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div>
                  <span className="text-skirting-silver/60 text-xs block">Subtotal</span>
                  <span className="text-lg font-semibold text-white">
                    ${subtotal.toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={addToCart}
                  className="bg-skirting-amber text-skirting-dark px-6 py-3 text-sm uppercase tracking-wider font-medium hover:bg-white transition-colors rounded-lg"
                >
                  Add to Cart
                </button>
              </div>

              {/* Additional Links */}
              <div className="flex flex-col sm:flex-row gap-4 mt-6 pt-6 border-t border-white/10">
                <Link
                  href="/#contact"
                  className="flex-1 px-6 py-3 border-2 border-skirting-silver/30 text-skirting-silver font-semibold uppercase tracking-wide hover:border-skirting-amber hover:text-skirting-amber transition-colors text-center"
                >
                  Request Quote
                </Link>
                <Link
                  href="/products"
                  className="flex-1 px-6 py-3 border-2 border-skirting-silver/30 text-skirting-silver font-semibold uppercase tracking-wide hover:border-skirting-amber hover:text-skirting-amber transition-colors text-center"
                >
                  View All Products
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* SEO Content */}
        <div className="mt-12 prose prose-invert max-w-none">
          <div className="bg-skirting-charcoal border border-white/10 rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Why Choose {product.name} from Innovation Skirting?
            </h2>
            <p className="text-skirting-silver/70 leading-relaxed mb-4">
              As New Zealand's only specialized skirting company, Innovation Skirting offers the best prices and highest
              quality on all skirting boards. The {product.name} is perfect for {product.category} applications,
              featuring {product.ledType?.toLowerCase() || "premium"} LED lighting and {product.height || "standard"} height profile.
            </p>
            <p className="text-skirting-silver/70 leading-relaxed">
              Order your {product.name} skirting boards today and experience why we're New Zealand's #1 choice for
              skirting boards. Best prices guaranteed, highest quality materials, and expert installation services
              available.
            </p>
          </div>
        </div>

        {/* Floating Cart Button */}
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
        {product && (
          <CheckoutModal
            isOpen={checkoutOpen}
            onClose={() => setCheckoutOpen(false)}
            cart={cart}
            products={[product]}
            quantities={quantities}
            lengths={lengths}
          />
        )}
      </div>
      <Footer />
    </div>
  )
}
