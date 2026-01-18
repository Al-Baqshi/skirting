"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { toast } from "sonner"
import type { StorefrontProduct } from "@/lib/supabase-products"

type CartItem = {
  id: string
  quantity: number
  length: number
}

type CheckoutModalProps = {
  isOpen: boolean
  onClose: () => void
  cart: CartItem[]
  products: StorefrontProduct[]
  quantities: Record<string, number>
  lengths: Record<string, number>
  onUpdateCart?: (cart: CartItem[]) => void
  onClearCart?: () => void
}

export function CheckoutModal({
  isOpen,
  onClose,
  cart,
  products,
  quantities,
  lengths,
  onUpdateCart,
  onClearCart,
}: CheckoutModalProps) {
  const [submitting, setSubmitting] = useState(false)
  const [localCart, setLocalCart] = useState<CartItem[]>(cart)
  const [localQuantities, setLocalQuantities] = useState<Record<string, number>>(quantities)
  const [localLengths, setLocalLengths] = useState<Record<string, number>>(lengths)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    notes: "",
  })

  // Sync local state with props when cart changes
  useEffect(() => {
    setLocalCart(cart)
    setLocalQuantities(quantities)
    setLocalLengths(lengths)
  }, [cart, quantities, lengths])

  // Calculate cart items with product details
  const cartItems = localCart.map((item) => {
    const product = products.find((p) => p.id === item.id)
    const qty = localQuantities[item.id] || item.quantity
    const len = localLengths[item.id] || item.length
    const price = product?.price || 0
    const subtotal = price * len * qty

    return {
      productId: item.id,
      productName: product?.name || "Unknown Product",
      productSlug: product?.slug || "",
      price,
      length: len,
      quantity: qty,
      subtotal,
      image: product?.image || "",
    }
  })

  const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0)

  // Update cart item quantity
  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    setLocalQuantities((prev) => ({ ...prev, [productId]: newQuantity }))
    setLocalCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity: newQuantity } : item))
    )
    if (onUpdateCart) {
      const updated = localCart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
      onUpdateCart(updated)
    }
  }

  // Update cart item length
  const updateLength = (productId: string, newLength: number) => {
    if (newLength < 0.1) return
    setLocalLengths((prev) => ({ ...prev, [productId]: newLength }))
    setLocalCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, length: newLength } : item))
    )
    if (onUpdateCart) {
      const updated = localCart.map((item) =>
        item.id === productId ? { ...item, length: newLength } : item
      )
      onUpdateCart(updated)
    }
  }

  // Remove item from cart
  const removeItem = (productId: string) => {
    const updated = localCart.filter((item) => item.id !== productId)
    setLocalCart(updated)
    if (onUpdateCart) {
      onUpdateCart(updated)
    }
    toast.success("Item removed from cart")
  }

  // Clear entire cart
  const clearCart = () => {
    if (confirm("Are you sure you want to clear your cart?")) {
      setLocalCart([])
      if (onClearCart) {
        onClearCart()
      } else if (onUpdateCart) {
        onUpdateCart([])
      }
      toast.success("Cart cleared")
    }
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const orderData = {
        customer: formData,
        items: cartItems,
        total: total.toFixed(2),
        orderDate: new Date().toISOString(),
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      })

      const json = await res.json()

      if (res.ok) {
        toast.success("Order submitted successfully! We'll contact you soon to arrange payment.")
        setFormData({
          name: "",
          email: "",
          phone: "",
          address: "",
          city: "",
          postalCode: "",
          notes: "",
        })
        // Clear cart after successful order
        if (onClearCart) {
          onClearCart()
        } else if (onUpdateCart) {
          onUpdateCart([])
        }
        setLocalCart([])
        onClose()
      } else {
        toast.error(`Error: ${json.error || "Failed to submit order"}`)
      }
    } catch (err) {
      toast.error(`Error: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        // Close modal when clicking backdrop
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
      onWheel={(e) => {
        // Prevent background scrolling when scrolling in modal
        e.stopPropagation()
      }}
      onTouchMove={(e) => {
        // Prevent background scrolling on mobile
        if (e.target === e.currentTarget) {
          e.preventDefault()
        }
      }}
    >
      <div className="bg-skirting-charcoal border border-white/10 rounded-lg sm:rounded-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col mx-2 sm:mx-0">
        {/* Header */}
        <div className="flex-shrink-0 bg-skirting-charcoal border-b border-white/10 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between rounded-t-lg sm:rounded-t-2xl">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Checkout</h2>
          <button
            onClick={onClose}
            className="text-skirting-silver hover:text-white transition-colors p-1.5 sm:p-2 hover:bg-white/10 rounded-lg touch-target"
            aria-label="Close"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <form id="checkout-form" onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Order Summary */}
          <div className="bg-skirting-dark border border-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-white">Order Summary</h3>
              {cartItems.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs sm:text-sm text-red-400 hover:text-red-300 transition-colors px-2 py-1 touch-target"
                >
                  Clear Cart
                </button>
              )}
            </div>
            <div className="space-y-3">
              {cartItems.length === 0 ? (
                <p className="text-skirting-silver/60 text-center py-4">Your cart is empty</p>
              ) : (
                cartItems.map((item) => (
                  <div key={item.productId} className="flex items-start gap-2 sm:gap-4 pb-3 border-b border-white/10 last:border-0">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="text-sm sm:text-base text-white font-medium truncate">{item.productName}</h4>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="text-red-400 hover:text-red-300 transition-colors p-1.5 touch-target flex-shrink-0"
                          title="Remove item"
                          aria-label="Remove item"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      
                      {/* Editable Quantity and Length - Stack on mobile */}
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 items-start sm:items-center mb-2">
                        <div className="flex items-center gap-1.5 w-full sm:w-auto min-w-0">
                          <label className="text-skirting-silver/60 text-xs whitespace-nowrap flex-shrink-0">Length:</label>
                          <div className="flex items-center gap-1 flex-1 sm:flex-none min-w-0">
                            <input
                              type="number"
                              min="0.1"
                              step="0.1"
                              value={item.length}
                              onChange={(e) => updateLength(item.productId, parseFloat(e.target.value) || 0.1)}
                              className="w-20 sm:w-16 bg-skirting-charcoal border border-white/10 rounded px-2 py-2 text-white text-sm focus:border-skirting-amber focus:outline-none flex-shrink-0"
                            />
                            <span className="text-skirting-silver/60 text-xs whitespace-nowrap flex-shrink-0">m</span>
                          </div>
                        </div>
                        <span className="text-skirting-silver/40 hidden sm:inline flex-shrink-0">×</span>
                        <div className="flex items-center gap-1.5 w-full sm:w-auto min-w-0">
                          <label className="text-skirting-silver/60 text-xs whitespace-nowrap flex-shrink-0">Qty:</label>
                          <div className="flex items-center border border-white/10 rounded bg-skirting-charcoal flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="px-3 py-2 text-skirting-silver hover:text-white transition-colors text-sm touch-target"
                              aria-label="Decrease quantity"
                            >
                              -
                            </button>
                            <span className="px-3 py-2 text-white text-sm min-w-8 text-center">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="px-3 py-2 text-skirting-silver hover:text-white transition-colors text-sm touch-target"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <span className="text-skirting-silver/60 text-xs ml-auto sm:ml-0 whitespace-nowrap flex-shrink-0">@ ${item.price}/m</span>
                      </div>
                      
                      <div className="text-right sm:text-left">
                        <p className="text-skirting-amber font-semibold text-sm sm:text-base">${item.subtotal.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {cartItems.length > 0 && (
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-base sm:text-lg font-semibold text-white">Total</span>
                <span className="text-xl sm:text-2xl font-bold text-skirting-amber">${total.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Customer Information */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-white">Customer Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-skirting-silver text-sm mb-1.5 sm:mb-2">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-skirting-dark border border-white/10 rounded-lg px-4 py-3 text-base text-white focus:border-skirting-amber focus:outline-none"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-skirting-silver text-sm mb-1.5 sm:mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-skirting-dark border border-white/10 rounded-lg px-4 py-3 text-base text-white focus:border-skirting-amber focus:outline-none"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-skirting-silver text-sm mb-1.5 sm:mb-2">Phone *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-skirting-dark border border-white/10 rounded-lg px-4 py-3 text-base text-white focus:border-skirting-amber focus:outline-none"
                  placeholder="+64 9 123 4567"
                />
              </div>
              <div>
                <label className="block text-skirting-silver text-sm mb-1.5 sm:mb-2">Postal Code</label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full bg-skirting-dark border border-white/10 rounded-lg px-4 py-3 text-base text-white focus:border-skirting-amber focus:outline-none"
                  placeholder="1010"
                />
              </div>
            </div>
            <div>
              <label className="block text-skirting-silver text-sm mb-1.5 sm:mb-2">Delivery Address *</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-skirting-dark border border-white/10 rounded-lg px-4 py-3 text-base text-white focus:border-skirting-amber focus:outline-none"
                placeholder="123 Main Street"
              />
            </div>
            <div>
              <label className="block text-skirting-silver text-sm mb-1.5 sm:mb-2">City *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full bg-skirting-dark border border-white/10 rounded-lg px-4 py-3 text-base text-white focus:border-skirting-amber focus:outline-none"
                placeholder="Auckland"
              />
            </div>
            <div>
              <label className="block text-skirting-silver text-sm mb-1.5 sm:mb-2">Additional Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full bg-skirting-dark border border-white/10 rounded-lg px-4 py-3 text-base text-white focus:border-skirting-amber focus:outline-none resize-none"
                placeholder="Any special instructions or requirements..."
              />
            </div>
          </div>

          {/* Info Notice */}
          <div className="bg-skirting-amber/10 border border-skirting-amber/30 rounded-lg p-3 sm:p-4">
            <p className="text-skirting-amber text-xs sm:text-sm">
              <strong>Note:</strong> After submitting your order, we'll contact you within 24 hours to arrange payment and delivery. No payment is required at this time.
            </p>
          </div>
          </form>
        </div>

        {/* Fixed Footer with Submit Button */}
        <div className="flex-shrink-0 border-t border-white/10 bg-skirting-charcoal px-4 sm:px-6 py-3 sm:py-4 rounded-b-lg sm:rounded-b-2xl">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 px-4 sm:px-6 py-3 border border-white/10 text-skirting-silver font-semibold uppercase tracking-wide hover:border-skirting-amber hover:text-skirting-amber transition-colors rounded-lg text-sm sm:text-base touch-target"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="checkout-form"
              disabled={submitting || cartItems.length === 0}
              className="w-full sm:flex-1 px-4 sm:px-6 py-3 bg-skirting-amber text-skirting-dark font-semibold uppercase tracking-wide hover:bg-white transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base touch-target"
            >
              {submitting ? "Submitting..." : "Submit Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
