import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { verifyAdminAuth } from "@/lib/admin-auth"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// GET - List all products (admin only)
export async function GET(request: NextRequest) {
  const isAuthenticated = await verifyAdminAuth()
  if (!isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { data: rows, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Map snake_case to camelCase so admin form and list get consistent data (edit form pre-fills correctly)
    const products = (rows || []).map((row: Record<string, unknown>) => ({
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
          : [40, 60, 80, 260, 300, 500],
      profile: row.profile ?? "",
      power: row.power ?? "",
      features: row.features ?? [],
      price: row.price ?? 0,
      description: row.description ?? "",
      category: row.category ?? "residential",
      seoTitle: row.seo_title ?? "",
      seoDescription: row.seo_description ?? "",
      metaKeywords: row.meta_keywords ?? [],
      inStock: row.in_stock !== false,
      is_active: row.is_active !== false,
    }))

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
      description,
      category,
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
    if (price === undefined || price === null || typeof price !== "number" || price < 0) {
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
    const insertData: any = {
      name,
      slug,
      image: image || (images && images[0]) || null,
      led_type: ledType || null,
      height: height || "4cm / 6cm / 8cm / 26cm / 30cm / 50cm",
      height_value: heightValue ?? 80,
      height_options:
        Array.isArray(heightOptions) && heightOptions.length > 0 ? heightOptions : [40, 60, 80, 260, 300, 500],
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
    }
    
    // Normalize images to 5 slots (Main, Params, Install, Accessories, Colours)
    const rawImages = Array.isArray(images) ? images : image ? [image] : []
    const normalizedImages = Array.from({ length: 5 }, (_, i) => {
      const v = rawImages[i]
      return typeof v === "string" && v.trim() ? v.trim() : ""
    })
    insertData.images = normalizedImages

    const { data: product, error } = await supabase
      .from("products")
      .insert(insertData)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ product }, { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    )
  }
}
