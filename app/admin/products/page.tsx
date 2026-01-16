"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AdminAuth } from "@/components/admin-auth"
import type { StorefrontProduct } from "@/lib/supabase-products"

type Product = StorefrontProduct & {
  is_active?: boolean
}

function AdminProductsPageContent() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Product & { images?: string[] }>>({
    name: "",
    image: "",
    images: [],
    ledType: "",
    height: "",
    heightValue: 0,
    profile: "",
    power: "",
    features: [],
    price: 0,
    description: "",
    category: "residential",
    seoTitle: "",
    seoDescription: "",
    metaKeywords: [],
    inStock: true,
    is_active: true,
  })
  const [newFeature, setNewFeature] = useState("")
  const [newKeyword, setNewKeyword] = useState("")
  const [showImageBrowser, setShowImageBrowser] = useState(false)
  const [newImagePath, setNewImagePath] = useState("")

  // Available product images in public/product folder
  const availableImages = [
    "/product/aluminium-skirting-board-with-warm-led-light.jpg",
    "/product/compact-aluminium-baseboard-with-led-lighting.jpg",
    "/product/modern-aluminium-skirting-with-rgb-led-strip.jpg",
    "/product/premium-wide-aluminium-skirting-with-integrated-li.jpg",
  ]

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/products")
      const json = await res.json()
      if (res.ok) {
        setProducts(json.products || [])
      } else {
        console.error("Failed to load products:", json.error)
      }
    } catch (err) {
      console.error("Error loading products:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name?.trim()) {
      toast.error("Product name is required")
      return
    }
    if (!formData.image && (!formData.images || formData.images.length === 0)) {
      toast.error("At least one product image is required")
      return
    }
    if (!formData.ledType?.trim()) {
      toast.error("LED type is required")
      return
    }
    if (!formData.height?.trim()) {
      toast.error("Height is required")
      return
    }
    if (!formData.heightValue || formData.heightValue <= 0) {
      toast.error("Height value must be greater than 0")
      return
    }
    if (!formData.profile?.trim()) {
      toast.error("Profile is required")
      return
    }
    if (!formData.power?.trim()) {
      toast.error("Power is required")
      return
    }
    if (!formData.price || formData.price <= 0) {
      toast.error("Price must be greater than 0")
      return
    }
    if (!formData.description?.trim()) {
      toast.error("Description is required")
      return
    }
    
    setSubmitting(true)
    
    try {
      if (editingId) {
        // Update existing product
        const res = await fetch(`/api/admin/products/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            image: formData.image || (formData.images && formData.images[0]) || "",
            images: formData.images || (formData.image ? [formData.image] : []),
            ledType: formData.ledType,
            height: formData.height,
            heightValue: formData.heightValue,
            profile: formData.profile,
            power: formData.power,
            features: formData.features || [],
            price: formData.price,
            description: formData.description,
            category: formData.category,
            seoTitle: formData.seoTitle,
            seoDescription: formData.seoDescription,
            metaKeywords: formData.metaKeywords || [],
            inStock: formData.inStock,
            isActive: formData.is_active !== false,
          }),
        })

        const json = await res.json()
        if (res.ok) {
          await loadProducts()
          setEditingId(null)
          setIsAdding(false)
          resetForm()
          toast.success(`Product "${formData.name}" has been updated successfully!`)
        } else {
          toast.error(`Error: ${json.error}`)
        }
      } else {
        // Create new product
        const res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            image: formData.image || (formData.images && formData.images[0]) || "",
            images: formData.images || (formData.image ? [formData.image] : []),
            ledType: formData.ledType,
            height: formData.height,
            heightValue: formData.heightValue,
            profile: formData.profile,
            power: formData.power,
            features: formData.features || [],
            price: formData.price,
            description: formData.description,
            category: formData.category,
            seoTitle: formData.seoTitle,
            seoDescription: formData.seoDescription,
            metaKeywords: formData.metaKeywords || [],
            inStock: formData.inStock,
            isActive: true,
          }),
        })

        const json = await res.json()
        if (res.ok) {
          await loadProducts()
          setIsAdding(false)
          resetForm()
          toast.success(`Product "${formData.name}" has been created successfully!`)
        } else {
          toast.error(`Error: ${json.error}`)
        }
      }
    } catch (err) {
      toast.error(`Error: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      image: "",
      images: [],
      ledType: "",
      height: "",
      heightValue: 0,
      profile: "",
      power: "",
      features: [],
      price: 0,
      description: "",
      category: "residential",
      seoTitle: "",
      seoDescription: "",
      metaKeywords: [],
      inStock: true,
      is_active: true,
    })
    setNewImagePath("")
    setNewFeature("")
    setNewKeyword("")
    setShowImageBrowser(false)
  }

  const startEdit = (product: Product & { images?: string[] }) => {
    // Handle both old format (single image) and new format (images array)
    const images = product.images && Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : []
    setFormData({
      ...product,
      images,
      image: product.image || images[0] || "",
    })
    setEditingId(product.id)
    setIsAdding(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return
    }

    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      })

      const json = await res.json()
      if (res.ok) {
        await loadProducts()
        toast.success("Product has been deleted successfully!")
      } else {
        toast.error(`Error: ${json.error}`)
      }
    } catch (err) {
      toast.error(`Error: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setDeletingId(null)
    }
  }

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...(formData.features || []), newFeature.trim()],
      })
      setNewFeature("")
    }
  }

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features?.filter((_, i) => i !== index) || [],
    })
  }

  const addKeyword = () => {
    if (newKeyword.trim()) {
      setFormData({
        ...formData,
        metaKeywords: [...(formData.metaKeywords || []), newKeyword.trim()],
      })
      setNewKeyword("")
    }
  }

  const removeKeyword = (index: number) => {
    setFormData({
      ...formData,
      metaKeywords: formData.metaKeywords?.filter((_, i) => i !== index) || [],
    })
  }

  const addImage = () => {
    if (newImagePath.trim()) {
      const path = newImagePath.trim()
      if (path.startsWith("/") || path.startsWith("http")) {
        const images = formData.images || []
        if (!images.includes(path)) {
          setFormData({
            ...formData,
            images: [...images, path],
            image: formData.image || path, // Set as primary if no primary image
          })
        }
        setNewImagePath("")
      }
    }
  }

  const removeImage = (index: number) => {
    const images = formData.images || []
    const newImages = images.filter((_, i) => i !== index)
    const removedImage = images[index]
    
    setFormData({
      ...formData,
      images: newImages,
      // If we removed the primary image, set the first remaining as primary
      image: formData.image === removedImage ? (newImages[0] || "") : formData.image,
    })
  }

  const setPrimaryImage = (index: number) => {
    const images = formData.images || []
    if (images[index]) {
      const selectedImage = images[index]
      // Reorder array to put selected image first
      const reorderedImages = [selectedImage, ...images.filter((_, i) => i !== index)]
      setFormData({
        ...formData,
        image: selectedImage,
        images: reorderedImages,
      })
    }
  }

  return (
    <div className="min-h-screen bg-skirting-dark">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Product Management</h1>
            <p className="text-skirting-silver/70">Add, edit, and manage skirting board products</p>
          </div>
          <button
            onClick={() => {
              resetForm()
              setEditingId(null)
              setIsAdding(true)
            }}
            className="px-6 py-3 bg-skirting-amber text-skirting-dark font-semibold uppercase tracking-wide hover:bg-white transition-colors"
          >
            + Add Product
          </button>
        </div>

        {/* Add/Edit Form */}
        {isAdding && (
          <div className="bg-skirting-charcoal border border-white/10 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-6">
              {editingId ? "Edit Product" : "Add New Product"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-skirting-silver text-sm mb-2">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-skirting-dark border border-white/10 rounded-lg px-4 py-2 text-white focus:border-skirting-amber focus:outline-none transition-all duration-200"
                    placeholder="SK-100 Classic"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-skirting-silver text-sm mb-2">Product Images *</label>
                  <div className="space-y-4">
                    {/* Add Image Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newImagePath}
                        onChange={(e) => setNewImagePath(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addImage()
                          }
                        }}
                        className="flex-1 bg-skirting-dark border border-white/10 rounded-lg px-4 py-2 text-white focus:border-skirting-amber focus:outline-none"
                        placeholder="/product/aluminium-skirting-board-with-warm-led-light.jpg"
                      />
                      <button
                        type="button"
                        onClick={addImage}
                        className="px-4 py-2 bg-skirting-amber text-skirting-dark font-medium rounded-lg hover:bg-white transition-colors text-sm whitespace-nowrap"
                      >
                        Add Image
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowImageBrowser(!showImageBrowser)}
                        className="px-4 py-2 bg-skirting-amber/20 text-skirting-amber border border-skirting-amber/30 rounded-lg hover:bg-skirting-amber/30 transition-colors text-sm whitespace-nowrap"
                      >
                        {showImageBrowser ? "Hide" : "Browse"}
                      </button>
                    </div>
                    
                    {/* Image Browser */}
                    {showImageBrowser && (
                      <div className="bg-skirting-dark border border-white/10 rounded-lg p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <p className="text-skirting-silver/60 text-xs mb-3">Select from available images in /public/product/</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {availableImages.map((imgPath) => (
                            <button
                              key={imgPath}
                              type="button"
                              onClick={() => {
                                const images = formData.images || []
                                if (!images.includes(imgPath)) {
                                  setFormData({
                                    ...formData,
                                    images: [...images, imgPath],
                                    image: formData.image || imgPath,
                                  })
                                }
                                setShowImageBrowser(false)
                              }}
                              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300 transform hover:scale-105 ${
                                (formData.images || []).includes(imgPath)
                                  ? "border-skirting-amber ring-2 ring-skirting-amber/50"
                                  : "border-white/10 hover:border-skirting-amber/50"
                              }`}
                            >
                              <Image
                                src={imgPath}
                                alt={imgPath.split("/").pop() || "Product"}
                                fill
                                className="object-cover transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all duration-300" />
                              {(formData.images || []).includes(imgPath) && (
                                <div className="absolute top-2 right-2 bg-skirting-amber text-skirting-dark rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold animate-pulse">
                                  ✓
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                        <p className="text-skirting-silver/40 text-xs mt-3">
                          Click to add images. First image will be set as primary.
                        </p>
                      </div>
                    )}

                    {/* Images Gallery */}
                    {(formData.images && formData.images.length > 0) || formData.image ? (
                      <div className="space-y-3">
                        <p className="text-skirting-silver/60 text-xs">
                          {formData.image && (
                            <span className="inline-block bg-skirting-amber/20 text-skirting-amber px-2 py-1 rounded text-xs mr-2">
                              Primary: {formData.image.split("/").pop()}
                            </span>
                          )}
                          {formData.images && formData.images.length > 0 && (
                            <span className="text-skirting-silver/60">
                              {formData.images.length} image{formData.images.length !== 1 ? "s" : ""} total
                            </span>
                          )}
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                          {((formData.images && formData.images.length > 0) ? formData.images : (formData.image ? [formData.image] : [])).map((imgPath, index) => (
                            <div
                              key={`${imgPath}-${index}`}
                              className="relative group aspect-square bg-skirting-dark border border-white/10 rounded-lg overflow-hidden transition-all duration-300 hover:border-skirting-amber/50"
                            >
                              <img
                                src={imgPath}
                                alt={`Product image ${index + 1}`}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.src = "/placeholder.svg"
                                }}
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                {formData.image !== imgPath && (
                                  <button
                                    type="button"
                                    onClick={() => setPrimaryImage(index)}
                                    className="px-3 py-1.5 bg-skirting-amber text-skirting-dark text-xs font-medium rounded hover:bg-white transition-all duration-200 transform hover:scale-105"
                                    title="Set as primary"
                                  >
                                    Set Primary
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded hover:bg-red-600 transition-all duration-200 transform hover:scale-105"
                                  title="Remove image"
                                >
                                  Remove
                                </button>
                              </div>
                              {formData.image === imgPath && (
                                <div className="absolute top-2 left-2 bg-skirting-amber text-skirting-dark px-2 py-1 rounded text-xs font-bold animate-pulse">
                                  Primary
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="border border-dashed border-white/20 rounded-lg p-8 text-center transition-all duration-300">
                        <p className="text-skirting-silver/40 text-sm">No images added yet. Add images above.</p>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-skirting-silver text-sm mb-2">LED Type *</label>
                  <select
                    required
                    value={formData.ledType || ""}
                    onChange={(e) => setFormData({ ...formData, ledType: e.target.value })}
                    className="w-full bg-skirting-dark border border-white/10 rounded-lg px-4 py-2 text-white focus:border-skirting-amber focus:outline-none transition-all duration-200"
                  >
                    <option value="">Select LED Type</option>
                    <option value="Warm White">Warm White</option>
                    <option value="Cool White">Cool White</option>
                    <option value="RGB">RGB</option>
                    <option value="Tunable White">Tunable White</option>
                  </select>
                </div>
                <div>
                  <label className="block text-skirting-silver text-sm mb-2">Height *</label>
                  <input
                    type="text"
                    required
                    value={formData.height || ""}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="w-full bg-skirting-dark border border-white/10 rounded-lg px-4 py-2 text-white focus:border-skirting-amber focus:outline-none transition-all duration-200"
                    placeholder="100mm"
                  />
                </div>
                <div>
                  <label className="block text-skirting-silver text-sm mb-2">Height Value (mm) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.heightValue || ""}
                    onChange={(e) => setFormData({ ...formData, heightValue: e.target.value ? Number(e.target.value) : 0 })}
                    className="w-full bg-skirting-dark border border-white/10 rounded-lg px-4 py-2 text-white focus:border-skirting-amber focus:outline-none transition-all duration-200"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="block text-skirting-silver text-sm mb-2">Profile *</label>
                  <input
                    type="text"
                    required
                    value={formData.profile || ""}
                    onChange={(e) => setFormData({ ...formData, profile: e.target.value })}
                    className="w-full bg-skirting-dark border border-white/10 rounded-lg px-4 py-2 text-white focus:border-skirting-amber focus:outline-none transition-all duration-200"
                    placeholder="Slim"
                  />
                </div>
                <div>
                  <label className="block text-skirting-silver text-sm mb-2">Power *</label>
                  <input
                    type="text"
                    required
                    value={formData.power || ""}
                    onChange={(e) => setFormData({ ...formData, power: e.target.value })}
                    className="w-full bg-skirting-dark border border-white/10 rounded-lg px-4 py-2 text-white focus:border-skirting-amber focus:outline-none transition-all duration-200"
                    placeholder="12V DC"
                  />
                </div>
                <div>
                  <label className="block text-skirting-silver text-sm mb-2">Price (NZD) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price || ""}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value ? Number(e.target.value) : 0 })}
                    className="w-full bg-skirting-dark border border-white/10 rounded-lg px-4 py-2 text-white focus:border-skirting-amber focus:outline-none transition-all duration-200"
                    placeholder="89"
                  />
                </div>
                <div>
                  <label className="block text-skirting-silver text-sm mb-2">Category *</label>
                  <select
                    required
                    value={formData.category || "residential"}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as "residential" | "smart" | "commercial" })
                    }
                    className="w-full bg-skirting-dark border border-white/10 rounded-lg px-4 py-2 text-white focus:border-skirting-amber focus:outline-none transition-all duration-200"
                  >
                    <option value="residential">Residential</option>
                    <option value="smart">Smart</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-skirting-silver text-sm mb-2">In Stock</label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.inStock === true}
                      onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                      className="w-5 h-5 cursor-pointer transition-all duration-200 accent-skirting-amber"
                    />
                    <span className="text-skirting-silver group-hover:text-white transition-colors duration-200">Product is in stock</span>
                  </label>
                </div>
                <div>
                  <label className="block text-skirting-silver text-sm mb-2">Active</label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active === true}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-5 h-5 cursor-pointer transition-all duration-200 accent-skirting-amber"
                    />
                    <span className="text-skirting-silver group-hover:text-white transition-colors duration-200">Product is active (visible to public)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-skirting-silver text-sm mb-2">Description *</label>
                <textarea
                  required
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full bg-skirting-dark border border-white/10 rounded-lg px-4 py-2 text-white focus:border-skirting-amber focus:outline-none transition-all duration-200"
                  placeholder="Perfect for residential spaces. Clean lines with warm ambient lighting."
                />
              </div>

              <div>
                <label className="block text-skirting-silver text-sm mb-2">Features</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.features?.map((feature, index) => (
                    <span
                      key={index}
                      className="bg-skirting-amber/20 text-skirting-amber px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {feature}
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addFeature()
                      }
                    }}
                    placeholder="Enter feature name"
                    className="flex-1 bg-skirting-dark border border-white/10 rounded-lg px-4 py-2 text-white focus:border-skirting-amber focus:outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="px-4 py-2 bg-skirting-amber/20 text-skirting-amber hover:bg-skirting-amber/30 transition-colors text-sm font-medium rounded"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-skirting-silver text-sm mb-2">SEO Title</label>
                <input
                  type="text"
                  value={formData.seoTitle || ""}
                  onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                  className="w-full bg-skirting-dark border border-white/10 rounded-lg px-4 py-2 text-white focus:border-skirting-amber focus:outline-none"
                  placeholder="SK-100 Classic Skirting Board - Premium LED Skirting in New Zealand"
                />
              </div>

              <div>
                <label className="block text-skirting-silver text-sm mb-2">SEO Description</label>
                <textarea
                  value={formData.seoDescription || ""}
                  onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                  rows={2}
                  className="w-full bg-skirting-dark border border-white/10 rounded-lg px-4 py-2 text-white focus:border-skirting-amber focus:outline-none"
                  placeholder="Discover the SK-100 Classic skirting board with integrated warm white LED lighting..."
                />
              </div>

              <div>
                <label className="block text-skirting-silver text-sm mb-2">Meta Keywords</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.metaKeywords?.map((keyword, index) => (
                    <span
                      key={index}
                      className="bg-skirting-amber/20 text-skirting-amber px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeKeyword(index)}
                        className="hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addKeyword()
                      }
                    }}
                    placeholder="Enter keyword"
                    className="flex-1 bg-skirting-dark border border-white/10 rounded-lg px-4 py-2 text-white focus:border-skirting-amber focus:outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={addKeyword}
                    className="px-4 py-2 bg-skirting-amber/20 text-skirting-amber hover:bg-skirting-amber/30 transition-colors text-sm font-medium rounded"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-skirting-amber text-skirting-dark font-semibold uppercase tracking-wide hover:bg-white transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {submitting ? "Saving..." : editingId ? "Update Product" : "Add Product"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false)
                    setEditingId(null)
                    resetForm()
                  }}
                  className="px-6 py-3 border border-white/10 text-skirting-silver font-semibold uppercase tracking-wide hover:border-skirting-amber hover:text-skirting-amber transition-all duration-200 transform hover:scale-105 active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-skirting-silver">Loading products...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
            <div
              key={product.id}
              className="bg-skirting-charcoal border border-white/10 rounded-xl overflow-hidden"
            >
              <div className="aspect-[4/3] relative bg-skirting-dark">
                {product.image && (product.image.startsWith("/") || product.image.startsWith("http")) ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    unoptimized={product.image.startsWith("http")}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-skirting-silver/50">
                    <span>No Image</span>
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold text-white mb-2">{product.name}</h3>
                <p className="text-skirting-silver/70 text-sm mb-3 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-semibold text-skirting-amber">${product.price}/m</span>
                  <div className="flex gap-2">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        product.is_active !== false
                          ? "bg-green-500/20 text-green-400"
                          : "bg-gray-500/20 text-gray-400"
                      }`}
                    >
                      {product.is_active !== false ? "Active" : "Inactive"}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        product.inStock
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {product.inStock ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(product)}
                    className="flex-1 px-4 py-2 bg-skirting-amber/20 text-skirting-amber hover:bg-skirting-amber/30 transition-colors text-sm font-medium rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    disabled={deletingId === product.id}
                    className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm font-medium rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingId === product.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}

        {!loading && products.length === 0 && !isAdding && (
          <div className="text-center py-12">
            <p className="text-skirting-silver/70 mb-4">No products yet. Add your first product!</p>
            <button
              onClick={() => {
                resetForm()
                setEditingId(null)
                setIsAdding(true)
              }}
              className="px-6 py-3 bg-skirting-amber text-skirting-dark font-semibold uppercase tracking-wide hover:bg-white transition-colors"
            >
              Add Product
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default function AdminProductsPage() {
  return (
    <AdminAuth>
      <AdminProductsPageContent />
    </AdminAuth>
  )
}
