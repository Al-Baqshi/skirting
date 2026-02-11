import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { verifyAdminAuth } from "@/lib/admin-auth"

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  }
  return createClient(supabaseUrl, supabaseServiceKey)
}

// GET - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuthenticated = await verifyAdminAuth()
  if (!isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const supabase = getSupabase()
    const { id } = await params
    const { data: product, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// PATCH - Update product
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuthenticated = await verifyAdminAuth()
  if (!isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const supabase = getSupabase()
    const { id } = await params
    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }
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
      features,
      price,
      description,
      category,
      seoTitle,
      seoDescription,
      metaKeywords,
      inStock,
      isActive,
    } = body

    const updateData: any = {}

    if (name !== undefined) {
      if (!name || typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json({ error: "Product name cannot be empty" }, { status: 400 })
      }
      updateData.name = name
      // Regenerate slug if name changed, ensuring uniqueness
      let baseSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
      
      // Check if slug already exists (excluding current product)
      let slug = baseSlug
      let counter = 1
      while (true) {
        const { data: existing } = await supabase
          .from("products")
          .select("id")
          .eq("slug", slug)
          .neq("id", id)
          .limit(1)
          .single()
        
        if (!existing) break
        slug = `${baseSlug}-${counter}`
        counter++
      }
      updateData.slug = slug
    }
    if (image !== undefined) updateData.image = image || (images && images[0]) || null
    // Always persist images array when provided (5 slots: Main, Params, Install, Accessories, Colours)
    if (images !== undefined) {
      const arr = Array.isArray(images) ? images : image ? [image] : []
      // Pad to 5 slots for consistent schema; filter to strings only
      const normalized = Array.from({ length: 5 }, (_, i) => {
        const v = arr[i]
        return typeof v === "string" && v.trim() ? v.trim() : ""
      })
      updateData.images = normalized
    }
    if (ledType !== undefined) updateData.led_type = ledType || null
    if (height !== undefined) updateData.height = height || null
    if (heightValue !== undefined) {
      if (heightValue !== null && (typeof heightValue !== "number" || heightValue <= 0)) {
        return NextResponse.json({ error: "Height value must be a positive number" }, { status: 400 })
      }
      updateData.height_value = heightValue || null
    }
    if (heightOptions !== undefined) {
      const opts = Array.isArray(heightOptions) ? heightOptions.filter((n) => [40, 60, 80, 260, 300, 500].includes(n)) : [40, 60, 80, 260, 300, 500]
      updateData.height_options = opts.length > 0 ? opts : [40, 60, 80, 260, 300, 500]
    }
    if (profile !== undefined) updateData.profile = profile || null
    if (power !== undefined) updateData.power = power || null
    if (features !== undefined) updateData.features = features || []
    if (price !== undefined) {
      if (typeof price !== "number" || price < 0) {
        return NextResponse.json({ error: "Price must be a non-negative number" }, { status: 400 })
      }
      updateData.price = price
    }
    if (description !== undefined) updateData.description = description || null
    if (category !== undefined) {
      if (!["residential", "smart", "commercial"].includes(category)) {
        return NextResponse.json({ error: "Category must be one of: residential, smart, commercial" }, { status: 400 })
      }
      updateData.category = category
    }
    if (seoTitle !== undefined) updateData.seo_title = seoTitle || null
    if (seoDescription !== undefined)
      updateData.seo_description = seoDescription || null
    if (metaKeywords !== undefined) updateData.meta_keywords = metaKeywords || []
    if (inStock !== undefined) updateData.in_stock = inStock
    if (isActive !== undefined) updateData.is_active = isActive

    const { data: product, error } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ product })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// DELETE - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuthenticated = await verifyAdminAuth()
  if (!isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const supabase = getSupabase()
    const { id } = await params
    const { error } = await supabase.from("products").delete().eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
