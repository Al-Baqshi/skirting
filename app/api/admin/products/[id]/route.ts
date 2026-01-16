import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { verifyAdminAuth } from "@/lib/admin-auth"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

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
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    )
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
    const { id } = await params
    const body = await request.json()
    const {
      name,
      image,
      images,
      ledType,
      height,
      heightValue,
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
    // Add images if provided (will fail silently if column doesn't exist)
    // To enable: ALTER TABLE products ADD COLUMN images TEXT[] DEFAULT '{}';
    if (images !== undefined) {
      if (Array.isArray(images) && images.length > 0) {
        updateData.images = images
      } else if (image) {
        updateData.images = [image]
      } else {
        updateData.images = []
      }
    }
    if (ledType !== undefined) updateData.led_type = ledType || null
    if (height !== undefined) updateData.height = height || null
    if (heightValue !== undefined) {
      if (heightValue !== null && (typeof heightValue !== "number" || heightValue <= 0)) {
        return NextResponse.json({ error: "Height value must be a positive number" }, { status: 400 })
      }
      updateData.height_value = heightValue || null
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
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    )
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
    const { id } = await params
    const { error } = await supabase.from("products").delete().eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    )
  }
}
