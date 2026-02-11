import { NextResponse } from "next/server"
import { getSupabaseProducts } from "@/lib/supabase-products"
import type { StorefrontProduct } from "@/lib/supabase-products"
import { defaultProducts } from "@/lib/products"

// Convert Product (localStorage format) to StorefrontProduct (API format)
function convertToStorefrontProduct(product: {
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
}): StorefrontProduct {
  return {
    id: String(product.id),
    name: product.name,
    slug: product.slug,
    image: product.image,
    ledType: product.ledType,
    height: product.height,
    heightValue: product.heightValue,
    profile: product.profile,
    power: product.power,
    features: product.features,
    price: product.price,
    description: product.description,
    category: product.category,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    metaKeywords: product.metaKeywords,
    inStock: product.inStock,
  }
}

export async function GET() {
  try {
    // Try to fetch from Supabase first
    const products = await getSupabaseProducts(50, true) // include inactive so all products show; user can reorder in admin
    return NextResponse.json({ products })
  } catch (err) {
    // If Supabase fails (e.g., table doesn't exist), fall back to default products
    console.warn("Supabase fetch failed, using default products:", err instanceof Error ? err.message : err)
    
    const fallbackProducts: StorefrontProduct[] = defaultProducts.map(convertToStorefrontProduct)
    return NextResponse.json({ products: fallbackProducts })
  }
}
