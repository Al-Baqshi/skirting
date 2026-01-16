/**
 * @deprecated This file is deprecated. The application now uses Supabase for product storage.
 * This file is kept for backward compatibility and fallback purposes only.
 * Use `lib/supabase-products.ts` and `StorefrontProduct` type instead.
 * 
 * Migration notes:
 * - Old Product type uses `id: number`, new StorefrontProduct uses `id: string` (UUID)
 * - All product operations should use Supabase API routes
 * - This file may be removed in a future version
 */

export interface Product {
  id: number
  name: string
  slug: string
  image: string
  ledType: string
  height: string
  heightValue: number
  profile: string
  power: string
  features: string[]
  price: number
  description: string
  category: "residential" | "smart" | "commercial"
  seoTitle?: string
  seoDescription?: string
  metaKeywords?: string[]
  inStock?: boolean
  createdAt?: string
  updatedAt?: string
}

// In a real app, this would be a database or API
// For now, we'll use localStorage for persistence
// DEPRECATED: Use Supabase instead
export const getProducts = (): Product[] => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("skirting_products")
    if (stored) {
      return JSON.parse(stored)
    }
  }
  return defaultProducts
}

export const saveProducts = (products: Product[]): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("skirting_products", JSON.stringify(products))
  }
}

export const addProduct = (product: Omit<Product, "id" | "slug" | "createdAt" | "updatedAt">): Product => {
  const products = getProducts()
  const newId = products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1
  const slug = product.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
  
  const newProduct: Product = {
    ...product,
    id: newId,
    slug,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    inStock: product.inStock ?? true,
  }
  
  products.push(newProduct)
  saveProducts(products)
  return newProduct
}

export const updateProduct = (id: number, updates: Partial<Product>): Product | null => {
  const products = getProducts()
  const index = products.findIndex((p) => p.id === id)
  if (index === -1) return null
  
  products[index] = {
    ...products[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  
  saveProducts(products)
  return products[index]
}

export const deleteProduct = (id: number): boolean => {
  const products = getProducts()
  const filtered = products.filter((p) => p.id !== id)
  if (filtered.length === products.length) return false
  
  saveProducts(filtered)
  return true
}

export const getProductBySlug = (slug: string): Product | undefined => {
  const products = getProducts()
  return products.find((p) => p.slug === slug)
}

export const defaultProducts: Product[] = [
  {
    id: 1,
    name: "SK-100 Classic",
    slug: "sk-100-classic",
    image: "/aluminium-skirting-board-with-warm-led-light.jpg",
    ledType: "Warm White",
    height: "100mm",
    heightValue: 100,
    profile: "Slim",
    power: "12V DC",
    features: ["Motion Sensor", "Dimmable"],
    price: 89,
    description: "Perfect for residential spaces. Clean lines with warm ambient lighting.",
    category: "residential",
    seoTitle: "SK-100 Classic Skirting Board - Premium LED Skirting in New Zealand",
    seoDescription: "Discover the SK-100 Classic skirting board with integrated warm white LED lighting. Best prices on premium skirting boards in New Zealand. Order now!",
    metaKeywords: ["skirting board", "LED skirting", "New Zealand", "aluminium skirting", "baseboard"],
    inStock: true,
  },
  {
    id: 2,
    name: "SK-120 Pro",
    slug: "sk-120-pro",
    image: "/modern-aluminium-skirting-with-rgb-led-strip.jpg",
    ledType: "RGB",
    height: "120mm",
    heightValue: 120,
    profile: "Standard",
    power: "24V DC",
    features: ["WiFi", "App Control", "Motion Sensor"],
    price: 149,
    description: "Full color control via smartphone app. Ideal for modern interiors.",
    category: "smart",
    seoTitle: "SK-120 Pro RGB Skirting - Smart LED Skirting Board New Zealand",
    seoDescription: "SK-120 Pro RGB skirting board with WiFi and app control. Innovation Skirting's premium smart skirting solution in New Zealand. Best quality, best prices.",
    metaKeywords: ["RGB skirting", "smart skirting", "WiFi skirting", "New Zealand", "LED baseboard"],
    inStock: true,
  },
  {
    id: 3,
    name: "SK-80 Compact",
    slug: "sk-80-compact",
    image: "/compact-aluminium-baseboard-with-led-lighting.jpg",
    ledType: "Cool White",
    height: "80mm",
    heightValue: 80,
    profile: "Ultra Slim",
    power: "12V DC",
    features: ["USB Port", "Dimmable"],
    price: 69,
    description: "Space-saving design with integrated USB charging capability.",
    category: "residential",
    seoTitle: "SK-80 Compact Skirting - Ultra Slim LED Baseboard NZ",
    seoDescription: "SK-80 Compact ultra-slim skirting board with USB charging. Perfect for modern homes in New Zealand. Specialized skirting solutions at best prices.",
    metaKeywords: ["compact skirting", "ultra slim skirting", "USB skirting", "New Zealand", "LED baseboard"],
    inStock: true,
  },
  {
    id: 4,
    name: "SK-150 Elite",
    slug: "sk-150-elite",
    image: "/premium-wide-aluminium-skirting-with-integrated-li.jpg",
    ledType: "Tunable White",
    height: "150mm",
    heightValue: 150,
    profile: "Wide",
    power: "24V DC",
    features: ["WiFi", "Power Outlet", "Motion Sensor", "USB"],
    price: 229,
    description: "Premium solution with full smart home integration and power outlets.",
    category: "commercial",
    seoTitle: "SK-150 Elite Premium Skirting - Commercial LED Skirting NZ",
    seoDescription: "SK-150 Elite premium wide skirting board with smart home integration. Innovation Skirting's top-tier commercial solution in New Zealand.",
    metaKeywords: ["premium skirting", "commercial skirting", "wide skirting", "New Zealand", "smart home skirting"],
    inStock: true,
  },
]
