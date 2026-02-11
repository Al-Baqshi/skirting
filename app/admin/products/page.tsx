"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AdminAuth } from "@/components/admin-auth"
import type { StorefrontProduct } from "@/lib/supabase-products"

type Product = StorefrontProduct & {
  is_active?: boolean
  heightOptions?: number[]
}

function AdminProductsPageContent() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const IMAGE_SLOTS = [
    { key: "main", label: "1. Main product image" },
    { key: "parameters", label: "2. Product parameters" },
    { key: "installation", label: "3. Front installation illustration" },
    { key: "accessories", label: "4. Accessories" },
    { key: "colors", label: "5. Colours" },
  ] as const
  const SLOT_KEYS = IMAGE_SLOTS.map((s) => s.key)

  const HEIGHT_OPTIONS = [
    { value: 40, label: "4cm" },
    { value: 60, label: "6cm" },
    { value: 80, label: "8cm" },
    { value: 260, label: "26cm" },
    { value: 300, label: "30cm" },
    { value: 500, label: "50cm" },
  ] as const
  const [formData, setFormData] = useState<
    Partial<Product & { imageSlots?: string[]; hasLed?: boolean; heightOptions?: number[] }>
  >({
    name: "",
    image: "",
    imageSlots: ["", "", "", "", ""],
    hasLed: true,
    height: "4cm / 6cm / 8cm / 26cm / 30cm / 50cm",
    heightOptions: [40, 60, 80, 260, 300, 500],
    price: 0,
    description: "",
    category: "residential",
    seoTitle: "",
    seoDescription: "",
    metaKeywords: [],
    inStock: true,
    is_active: true,
  })
  const [newKeyword, setNewKeyword] = useState("")
  const [showImageBrowser, setShowImageBrowser] = useState(false)
  const [imageBrowserSlot, setImageBrowserSlot] = useState<number | null>(null)
  const [newImagePath, setNewImagePath] = useState("")
  const [folderImages, setFolderImages] = useState<Array<{ name: string; path: string; images: Array<{ name: string; url: string }> }>>([])
  const [folderImagesLoading, setFolderImagesLoading] = useState(false)
  const [folderImagesError, setFolderImagesError] = useState<string | null>(null)
  const [expandedFolder, setExpandedFolder] = useState<string | null>(null)
  const [folderSearch, setFolderSearch] = useState("")
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null)
  const [productSearch, setProductSearch] = useState("")
  const [showImageViewer, setShowImageViewer] = useState(false)
  const [imageViewerIndex, setImageViewerIndex] = useState(0)
  const formRef = useRef<HTMLDivElement>(null)

  const openImageViewer = (index: number) => {
    setImageViewerIndex(Math.max(0, Math.min(4, index)))
    setShowImageViewer(true)
  }
  const viewerSlots = formData.imageSlots ?? ["", "", "", "", ""]
  const viewerPrev = () => setImageViewerIndex((i) => (i <= 0 ? 4 : i - 1))
  const viewerNext = () => setImageViewerIndex((i) => (i >= 4 ? 0 : i + 1))

  useEffect(() => {
    if (!showImageViewer) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowImageViewer(false)
      if (e.key === "ArrowLeft") viewerPrev()
      if (e.key === "ArrowRight") viewerNext()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [showImageViewer])

  // Build images array from 5 slots (order preserved; empty string for unused)
  const getImagesFromSlots = (): string[] => {
    const slots = formData.imageSlots ?? ["", "", "", "", ""]
    return slots.map((u) => (u && String(u).trim()) || "")
  }
  const getPrimaryImage = (): string => {
    const slots = formData.imageSlots ?? ["", "", "", "", ""]
    const first = slots.find((u) => u && String(u).trim())
    return formData.image || first || ""
  }
  const hasAtLeastOneImage = (): boolean => getImagesFromSlots().some((u) => u !== "")

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
    const imagesToSave = getImagesFromSlots()
    if (!hasAtLeastOneImage()) {
      toast.error("At least the main product image is required")
      return
    }
    const opts = formData.heightOptions ?? []
    if (opts.length === 0) {
      toast.error("At least one height option is required")
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
    const ledLabel = formData.hasLed === false ? "Without LED" : "With LED"
    
    try {
      if (editingId) {
        // Update existing product
        const res = await fetch(`/api/admin/products/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            image: getPrimaryImage(),
            images: imagesToSave,
            ledType: ledLabel,
            height: (formData.heightOptions ?? []).sort((a, b) => a - b).map((h) => `${h / 10}cm`).join(" / ") || "4cm / 6cm / 8cm / 26cm / 30cm / 50cm",
            heightOptions: formData.heightOptions ?? [40, 60, 80, 260, 300, 500],
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

        let json: { error?: string }
        try {
          json = await res.json()
        } catch {
          toast.error(res.ok ? "Invalid response" : `Update failed (${res.status}). Check server logs.`)
          return
        }
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
            image: getPrimaryImage(),
            images: imagesToSave,
            ledType: ledLabel,
            height: (formData.heightOptions ?? []).sort((a, b) => a - b).map((h) => `${h / 10}cm`).join(" / ") || "4cm / 6cm / 8cm / 26cm / 30cm / 50cm",
            heightOptions: formData.heightOptions ?? [40, 60, 80, 260, 300, 500],
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

        let json: { error?: string }
        try {
          json = await res.json()
        } catch {
          toast.error(res.ok ? "Invalid response" : `Create failed (${res.status}). Check server logs.`)
          return
        }
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
      imageSlots: ["", "", "", "", ""],
      hasLed: true,
      height: "4cm / 6cm / 8cm / 26cm / 30cm / 50cm",
      heightOptions: [40, 60, 80, 260, 300, 500],
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
    setNewKeyword("")
    setShowImageBrowser(false)
    setImageBrowserSlot(null)
    setFolderImagesError(null)
  }

  const startEdit = (product: Product & { images?: string[]; heightOptions?: number[] }) => {
    const raw = product.images && Array.isArray(product.images) ? product.images : product.image ? [product.image] : []
    const imageSlots: string[] = [raw[0] ?? "", raw[1] ?? "", raw[2] ?? "", raw[3] ?? "", raw[4] ?? ""]
    const heightOpts = Array.isArray(product.heightOptions) && product.heightOptions.length > 0
      ? product.heightOptions.filter((n) => [40, 60, 80, 260, 300, 500].includes(n))
      : [40, 60, 80, 260, 300, 500]
    setFormData({
      ...product,
      imageSlots,
      image: product.image || raw[0] || "",
      hasLed: product.ledType?.toLowerCase() !== "without led",
      heightOptions: heightOpts,
    })
    setEditingId(product.id)
    setIsAdding(true)
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0)
  }

  const setSlotImage = (index: number, value: string) => {
    const slots = [...(formData.imageSlots ?? ["", "", "", "", ""])]
    slots[index] = value
    setFormData({ ...formData, imageSlots: slots, image: formData.image || value || slots[0] || "" })
  }

  const openImageBrowser = (slotIndex: number) => {
    setImageBrowserSlot(slotIndex)
    setShowImageBrowser(true)
    setExpandedFolder(null)
    setFolderImagesError(null)
    setFolderImagesLoading(true)
    fetch("/api/admin/product-images")
      .then((r) => {
        if (!r.ok) {
          if (r.status === 401) setFolderImagesError("Please log in to admin to browse folders.")
          else setFolderImagesError("Could not load folders. Try again.")
          return { folders: [] }
        }
        return r.json()
      })
      .then((data) => {
        setFolderImages(data.folders ?? [])
      })
      .catch(() => {
        setFolderImagesError("Could not load folders. Check your connection.")
        setFolderImages([])
      })
      .finally(() => setFolderImagesLoading(false))
  }

  const selectImageForSlot = (url: string) => {
    if (imageBrowserSlot !== null) {
      setSlotImage(imageBrowserSlot, url)
      toast.success(`Assigned to ${IMAGE_SLOTS[imageBrowserSlot]?.label}`)
      // Auto-advance to next slot so you can assign 1, 2, 3, 4 in sequence
      const next = imageBrowserSlot < 4 ? imageBrowserSlot + 1 : imageBrowserSlot
      setImageBrowserSlot(next)
    }
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

  return (
    <div className="min-h-screen bg-skirting-dark">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Product Management</h1>
            <p className="text-skirting-silver/70">Add, edit, and manage skirting board products</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/orders"
              className="px-6 py-3 border border-white/10 text-skirting-silver font-semibold uppercase tracking-wide hover:border-skirting-amber hover:text-skirting-amber transition-colors"
            >
              View Orders
            </Link>
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
        </div>

        {/* Add/Edit Form */}
        {isAdding && (
          <div ref={formRef} className="bg-skirting-charcoal border border-white/10 rounded-2xl p-6 mb-8">
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
                  <label className="block text-skirting-silver text-sm mb-2">Product images (path or URL) *</label>
                  <p className="text-skirting-silver/60 text-xs mb-3">At least the main product image is required. Order: Main → Parameters → Installation → Accessories → Colours.</p>
                  <div className="space-y-3">
                    {IMAGE_SLOTS.map((slot, index) => (
                      <div
                        key={slot.key}
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverSlot(index) }}
                        onDragLeave={() => setDragOverSlot(null)}
                        onDrop={(e) => {
                          e.preventDefault()
                          setDragOverSlot(null)
                          const url = e.dataTransfer.getData("text/plain")
                          if (url) setSlotImage(index, url)
                        }}
                        className={`flex flex-col sm:flex-row sm:items-center gap-2 p-2 rounded-lg transition-colors ${
                          dragOverSlot === index ? "bg-skirting-amber/20 ring-2 ring-skirting-amber" : ""
                        }`}
                      >
                        <label className="text-skirting-silver text-xs sm:w-48 shrink-0">{slot.label}</label>
                        <input
                          type="text"
                          value={(formData.imageSlots ?? ["", "", "", "", ""])[index] ?? ""}
                          onChange={(e) => setSlotImage(index, e.target.value.trim())}
                          className="flex-1 bg-skirting-dark border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-skirting-amber focus:outline-none"
                          placeholder={index === 0 ? "/product/your-product/main.png" : "Optional"}
                        />
                        <button
                          type="button"
                          onClick={() => openImageBrowser(index)}
                          className="px-3 py-2 bg-skirting-amber/20 text-skirting-amber border border-skirting-amber/30 rounded-lg hover:bg-skirting-amber/30 text-sm whitespace-nowrap"
                        >
                          Browse
                        </button>
                        {((formData.imageSlots ?? [])[index]) ? (
                          <div className="flex items-center gap-2 shrink-0">
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={() => openImageViewer(index)}
                              onKeyDown={(e) => e.key === "Enter" && openImageViewer(index)}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData("text/plain", (formData.imageSlots ?? [])[index] ?? "")
                                e.dataTransfer.effectAllowed = "move"
                              }}
                              className="relative w-14 h-14 rounded-lg overflow-hidden bg-skirting-dark border border-white/10 hover:border-skirting-amber focus:border-skirting-amber focus:outline-none cursor-grab active:cursor-grabbing"
                              title="View full size (or drag to move)"
                            >
                              <img
                                src={(formData.imageSlots ?? [])[index]}
                                alt=""
                                className="w-full h-full object-cover pointer-events-none"
                                onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg" }}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => openImageViewer(index)}
                              className="text-xs text-skirting-amber hover:underline whitespace-nowrap"
                            >
                              View full
                            </button>
                          </div>
                        ) : (
                          <div className="w-14 h-14 shrink-0 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center text-skirting-silver/50 text-xs">
                            Drop
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {showImageBrowser && imageBrowserSlot !== null && (
                    <div className="mt-4 bg-skirting-dark border border-white/10 rounded-xl p-4 flex flex-col max-h-[75vh]">
                      {/* Sticky header: assignment slots + search + close */}
                      <div className="shrink-0 space-y-3 mb-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-skirting-silver text-sm">Assigning to:</span>
                            {IMAGE_SLOTS.map((slot, idx) => {
                              const short = ["Main", "Params", "Install", "Accessories", "Colours"][idx]
                              const hasImg = !!((formData.imageSlots ?? [])[idx])
                              return (
                                <button
                                  key={slot.key}
                                  type="button"
                                  onClick={() => setImageBrowserSlot(idx)}
                                  onDragOver={(e) => e.preventDefault()}
                                  onDrop={(e) => {
                                    e.preventDefault()
                                    const url = e.dataTransfer.getData("text/plain")
                                    if (url) setSlotImage(idx, url)
                                  }}
                                  title={`${slot.label} — drop image here`}
                                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                                    imageBrowserSlot === idx
                                      ? "bg-skirting-amber text-skirting-dark"
                                      : "bg-white/10 text-skirting-silver hover:bg-white/20"
                                  }`}
                                >
                                  {idx + 1}. {short}
                                  {hasImg && <span className="text-[10px] opacity-70">✓</span>}
                                </button>
                              )
                            })}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setShowImageBrowser(false)
                              setImageBrowserSlot(null)
                              setFolderImagesError(null)
                            }}
                            className="text-skirting-silver hover:text-white p-1 shrink-0"
                            aria-label="Close"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <input
                          type="text"
                          value={folderSearch}
                          onChange={(e) => setFolderSearch(e.target.value)}
                          placeholder="Search folder name…"
                          className="w-full bg-skirting-charcoal border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-skirting-silver/50 focus:border-skirting-amber focus:outline-none"
                        />
                      </div>
                      <p className="text-skirting-silver/60 text-xs mb-3 shrink-0">
                        Click folder to expand, click image to assign to <strong className="text-skirting-amber">{IMAGE_SLOTS[imageBrowserSlot]?.label}</strong>. Panel stays open — assign one, two, three, four or all five in sequence.
                      </p>
                      {folderImagesLoading ? (
                        <p className="text-skirting-silver/60 text-sm py-8">Loading folders…</p>
                      ) : folderImagesError ? (
                        <p className="text-skirting-amber/90 text-sm py-8">{folderImagesError}</p>
                      ) : folderImages.length === 0 ? (
                        <p className="text-skirting-silver/60 text-sm py-8">No folders found in /public/product/. Add subfolders there (e.g. public/product/your-product/) with images.</p>
                      ) : (() => {
                        const q = folderSearch.trim().toLowerCase()
                        const filtered = q
                          ? folderImages.filter((f) => f.name.toLowerCase().includes(q))
                          : folderImages
                        const pinned = expandedFolder ? filtered.find((f) => f.name === expandedFolder) : null
                        const rest = filtered.filter((f) => f.name !== expandedFolder)
                        const ordered = pinned ? [pinned, ...rest] : filtered
                        if (ordered.length === 0) {
                          return <p className="text-skirting-silver/60 text-sm py-4">No folders match &quot;{folderSearch}&quot;</p>
                        }
                        return (
                          <div className="min-h-0 flex-1 overflow-y-auto space-y-2 pr-1">
                            {ordered.map((folder) => (
                              <div key={folder.name} className="border border-white/10 rounded-lg overflow-hidden">
                                <button
                                  type="button"
                                  onClick={() => setExpandedFolder(expandedFolder === folder.name ? null : folder.name)}
                                  className="w-full flex items-center justify-between px-4 py-3 bg-skirting-charcoal/50 hover:bg-skirting-charcoal text-left text-sm font-medium text-white"
                                >
                                  <span className="truncate">{folder.name}</span>
                                  <span className="text-skirting-silver/70 text-xs shrink-0 ml-2">
                                    {folder.images.length} image{folder.images.length !== 1 ? "s" : ""}
                                  </span>
                                  <svg
                                    className={`w-5 h-5 shrink-0 transition-transform ${expandedFolder === folder.name ? "rotate-180" : ""}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                                {expandedFolder === folder.name && (
                                  <div className="p-3 pt-0 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                    {folder.images.map((img) => (
                                      <div
                                        key={img.url}
                                        draggable
                                        onDragStart={(e) => {
                                          e.dataTransfer.setData("text/plain", img.url)
                                          e.dataTransfer.effectAllowed = "copy"
                                        }}
                                        onClick={() => selectImageForSlot(img.url)}
                                        className="relative aspect-square rounded-lg overflow-hidden border-2 border-white/10 hover:border-skirting-amber focus:border-skirting-amber focus:outline-none transition-colors cursor-grab active:cursor-grabbing"
                                      >
                                        <img
                                          src={img.url}
                                          alt={img.name}
                                          className="w-full h-full object-cover pointer-events-none"
                                          onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg" }}
                                        />
                                        <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center">
                                          <span className="opacity-0 hover:opacity-100 text-white text-xs px-2 py-1 bg-skirting-amber rounded">
                                            Drag or click
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )
                      })()}
                      <p className="text-skirting-silver/50 text-xs mt-4 shrink-0">
                        Or paste a path below (e.g. /product/folder/image.png)
                      </p>
                      <div className="flex gap-2 mt-2">
                        <input
                          type="text"
                          value={newImagePath}
                          onChange={(e) => setNewImagePath(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              if (newImagePath.trim()) selectImageForSlot(newImagePath.trim())
                              setNewImagePath("")
                            }
                          }}
                          className="flex-1 bg-skirting-dark border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                          placeholder="/product/folder/image.png"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newImagePath.trim()) selectImageForSlot(newImagePath.trim())
                            setNewImagePath("")
                          }}
                          className="px-4 py-2 bg-skirting-amber text-skirting-dark text-sm font-medium rounded-lg shrink-0"
                        >
                          Set
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="block text-skirting-silver text-sm">LED Included</label>
                  <label className="flex items-center gap-2 cursor-pointer group w-fit">
                    <input
                      type="checkbox"
                      checked={formData.hasLed !== false}
                      onChange={(e) => setFormData({ ...formData, hasLed: e.target.checked })}
                      className="w-5 h-5 cursor-pointer transition-all duration-200 accent-skirting-amber"
                    />
                    <span className="text-skirting-silver group-hover:text-white transition-colors duration-200">
                      With LED (uncheck for without)
                    </span>
                  </label>
                </div>
                <div>
                  <label className="block text-skirting-silver text-sm mb-2">Height options (multi-select) *</label>
                  <p className="text-skirting-silver/60 text-xs mb-2">Default: all sizes. Uncheck to deselect sizes for this product.</p>
                  <div className="flex flex-wrap gap-4">
                    {HEIGHT_OPTIONS.map((opt) => {
                      const checked = (formData.heightOptions ?? []).includes(opt.value)
                      return (
                        <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              const current = formData.heightOptions ?? [40, 60, 80, 260, 300, 500]
                              const next = e.target.checked
                                ? [...current.filter((n) => n !== opt.value), opt.value].sort((a, b) => a - b)
                                : current.filter((n) => n !== opt.value)
                              if (next.length === 0) {
                                toast.error("At least one height must be selected")
                                return
                              }
                              setFormData({ ...formData, heightOptions: next })
                            }}
                            className="w-5 h-5 accent-skirting-amber"
                          />
                          <span className="text-skirting-silver">{opt.label}</span>
                        </label>
                      )
                    })}
                  </div>
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

              <div className="bg-skirting-dark/40 border border-white/10 rounded-lg p-3 text-skirting-silver text-sm">
                Default material: <span className="text-white font-medium">Aluminum</span>
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
          <>
            <div className="mb-6">
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search product name..."
                className="w-full sm:w-80 bg-skirting-charcoal border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-skirting-silver/50 focus:border-skirting-amber focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products
              .filter((p) => !productSearch.trim() || p.name.toLowerCase().includes(productSearch.trim().toLowerCase()))
              .map((product) => (
            <div
              key={product.id}
              className="bg-skirting-charcoal border border-white/10 rounded-xl overflow-hidden"
            >
              <div className="aspect-4/3 relative bg-skirting-dark">
                <Image
                  src={(product.image && (product.image.startsWith("/") || product.image.startsWith("http")) ? product.image : "/placeholder.svg")}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover"
                  unoptimized={product.image?.startsWith("http") ?? false}
                />
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
                    type="button"
                    onClick={() => startEdit(product)}
                    className="flex-1 px-4 py-2 bg-skirting-amber/20 text-skirting-amber hover:bg-skirting-amber/30 transition-colors text-sm font-medium rounded"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
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
          </>
        )}

        {!loading && products.length === 0 && !isAdding ? (
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
        ) : !loading && productSearch.trim() && products.filter((p) => p.name.toLowerCase().includes(productSearch.trim().toLowerCase())).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-skirting-silver/70">No products match &quot;{productSearch}&quot;</p>
          </div>
        ) : null}
      </div>
      <Footer />

      {/* Full-size image viewer with flip (admin) */}
      {showImageViewer && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/90"
          onClick={() => setShowImageViewer(false)}
          role="dialog"
          aria-modal="true"
          aria-label="View product image full size"
        >
          <div className="shrink-0 flex items-center justify-between gap-4 px-4 py-3 border-b border-white/10">
            <span className="text-skirting-amber font-medium">
              {IMAGE_SLOTS[imageViewerIndex]?.label ?? `Slot ${imageViewerIndex + 1}`}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); viewerPrev() }}
                className="p-2 rounded-lg bg-white/10 text-white hover:bg-skirting-amber hover:text-skirting-dark transition-colors"
                aria-label="Previous image"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-skirting-silver text-sm min-w-16 text-center">
                {imageViewerIndex + 1} / 5
              </span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); viewerNext() }}
                className="p-2 rounded-lg bg-white/10 text-white hover:bg-skirting-amber hover:text-skirting-dark transition-colors"
                aria-label="Next image"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowImageViewer(false)}
              className="p-2 rounded-lg text-skirting-silver hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div
            className="flex-1 flex items-center justify-center p-4 min-h-0 overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {viewerSlots[imageViewerIndex] ? (
              <img
                src={viewerSlots[imageViewerIndex]}
                alt={IMAGE_SLOTS[imageViewerIndex]?.label ?? ""}
                className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg"
                onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg" }}
              />
            ) : (
              <div className="text-skirting-silver/70 text-center py-12 px-6 rounded-xl border-2 border-dashed border-white/20">
                <p className="font-medium">No image in this slot</p>
                <p className="text-sm mt-1">Use Browse or paste a path to assign an image to {IMAGE_SLOTS[imageViewerIndex]?.label}.</p>
              </div>
            )}
          </div>
          <div className="shrink-0 flex justify-center gap-1.5 px-4 py-3 border-t border-white/10">
            {IMAGE_SLOTS.map((slot, idx) => (
              <button
                key={slot.key}
                type="button"
                onClick={(e) => { e.stopPropagation(); setImageViewerIndex(idx) }}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  imageViewerIndex === idx ? "bg-skirting-amber" : "bg-white/30 hover:bg-white/50"
                }`}
                aria-label={`Go to ${slot.label}`}
                title={slot.label}
              />
            ))}
          </div>
        </div>
      )}
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
