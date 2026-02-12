import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { verifyAdminAuth } from "@/lib/admin-auth"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Columns that exist only after migration 007 (price_by_height, colors)
const SELECT_LEGACY =
  "id,name,slug,image,images,led_type,height,height_value,height_options,profile,power,features,price,description,category,seo_title,seo_description,meta_keywords,in_stock,is_active,created_at,updated_at"

function mapRowToProduct(row: Record<string, unknown>) {
  return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      image: row.image ?? "",
      images: Array.isArray(row.images) ? row.images : row.image ? [row.image] : [],
      ledType: row.led_type ?? "",
      height: row.height ?? "",
      heightValue: row.height_value ?? null,
      heightOptions:
        Array.isArray(row.height_options) && row.height_options.length > 0
          ? row.height_options
          : [30, 40, 50, 60, 70, 80, 90, 100, 260],
      profile: row.profile ?? "",
      power: row.power ?? "",
      features: row.features ?? [],
      price: row.price ?? 0,
      priceByHeight:
        row.price_by_height && typeof row.price_by_height === "object"
          ? row.price_by_height
          : undefined,
      description: row.description ?? "",
      category: row.category ?? "residential",
      colors: Array.isArray(row.colors) ? row.colors : [],
      seoTitle: row.seo_title ?? "",
      seoDescription: row.seo_description ?? "",
      metaKeywords: row.meta_keywords ?? [],
      inStock: row.in_stock !== false,
      is_active: row.is_active !== false,
    }
}

// GET - List all products (admin only)
export async function GET(request: NextRequest) {
  const isAuthenticated = await verifyAdminAuth()
  if (!isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    let rows: Record<string, unknown>[] | null = null
    let error: { message: string } | null = null

    const { data, error: err } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })

    if (err) {
      if (err.message?.includes("colors") || err.message?.includes("price_by_height") || err.message?.includes("schema cache")) {
        const { data: legacyData, error: legacyErr } = await supabase
          .from("products")
          .select(SELECT_LEGACY)
          .order("created_at", { ascending: false })
        if (legacyErr) {
          return NextResponse.json({ error: legacyErr.message }, { status: 500 })
        }
        rows = legacyData
      } else {
        return NextResponse.json({ error: err.message }, { status: 500 })
      }
    } else {
      rows = data
    }

    const products = (rows || []).map(mapRowToProduct)
    return NextResponse.json({ products })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    )
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  const isAuthenticated = await verifyAdminAuth()
  if (!isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      name,
      image,
      images,
      ledType,
      height,
      heightValue,
      heightOptions,
      profile,
      power,
      features = [],
      price,
      priceByHeight,
      description,
      category,
      colors = [],
      seoTitle,
      seoDescription,
      metaKeywords = [],
      inStock = true,
      isActive = true,
    } = body

    // Validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 })
    }
    if (!image && (!images || !Array.isArray(images) || images.length === 0)) {
      return NextResponse.json({ error: "At least one product image is required" }, { status: 400 })
    }
    const hasPrice =
      (typeof price === "number" && price >= 0) ||
      (priceByHeight && typeof priceByHeight === "object" && Object.values(priceByHeight).some((v) => typeof v === "number" && v >= 0))
    if (!hasPrice) {
      return NextResponse.json({ error: "Price or priceByHeight (per size) is required" }, { status: 400 })
    }
    if (price !== undefined && price !== null && (typeof price !== "number" || price < 0)) {
      return NextResponse.json({ error: "Price must be a non-negative number" }, { status: 400 })
    }
    if (heightValue !== undefined && heightValue !== null && (typeof heightValue !== "number" || heightValue <= 0)) {
      return NextResponse.json({ error: "Height value must be a positive number" }, { status: 400 })
    }
    if (category && !["residential", "smart", "commercial"].includes(category)) {
      return NextResponse.json({ error: "Category must be one of: residential, smart, commercial" }, { status: 400 })
    }

    // Generate slug from name, ensuring uniqueness
    let baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
    
    // Check if slug already exists and append number if needed
    let slug = baseSlug
    let counter = 1
    while (true) {
      const { data: existing } = await supabase
        .from("products")
        .select("id")
        .eq("slug", slug)
        .limit(1)
        .single()
      
      if (!existing) break
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Prepare insert data
    // Note: If images column doesn't exist, add it with: ALTER TABLE products ADD COLUMN images TEXT[] DEFAULT '{}';
    const rawImages = Array.isArray(images) ? images : image ? [image] : []
    const normalizedImages = Array.from({ length: 5 }, (_, i) => {
      const v = rawImages[i]
      return typeof v === "string" && v.trim() ? v.trim() : ""
    })

    const insertData: Record<string, unknown> = {
      name,
      slug,
      image: image || (images && images[0]) || null,
      led_type: ledType || null,
      height: height || "3cm / 4cm / 5cm / 6cm / 8cm / 26cm",
      height_value: heightValue ?? 50,
      height_options:
        Array.isArray(heightOptions) && heightOptions.length > 0 ? heightOptions : [30, 40, 50, 60, 70, 80, 90, 100, 260],
      profile: profile || null,
      power: power || null,
      features: features || [],
      price: price || 0,
      description: description || null,
      category: category || "residential",
      seo_title: seoTitle || null,
      seo_description: seoDescription || null,
      meta_keywords: metaKeywords || [],
      in_stock: inStock !== false,
      is_active: isActive !== false,
      images: normalizedImages,
    }

    if (priceByHeight && typeof priceByHeight === "object" && Object.keys(priceByHeight).length > 0) {
      insertData.price_by_height = priceByHeight
    }
    const colorsFiltered = Array.isArray(colors) ? colors.filter((c: unknown) => typeof c === "string" && (c as string).trim() !== "") : []
    if (colorsFiltered.length > 0) {
      insertData.colors = colorsFiltered
    }

    let result = await supabase.from("products").insert(insertData).select().single()

    if (result.error && (result.error.message?.includes("colors") || result.error.message?.includes("price_by_height") || result.error.message?.includes("schema cache"))) {
      delete insertData.price_by_height
      delete insertData.colors
      result = await supabase.from("products").insert(insertData).select().single()
    }

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }
    const product = result.data

    return NextResponse.json({ product }, { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    )
  }
}
