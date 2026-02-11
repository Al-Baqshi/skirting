import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

/**
 * One-time seed: inserts the real product "Sharp Modern A3" (RMS-A3).
 * Call once after deleting test products. Optional: ?key=skirting-seed (or set SEED_KEY in env).
 * Remove or disable this route after seeding if you prefer.
 */
export async function POST(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key") ?? process.env.SEED_KEY
  if (key !== "skirting-seed" && !process.env.SEED_KEY) {
    return NextResponse.json({ error: "Missing or invalid seed key. Use ?key=skirting-seed" }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" },
      { status: 500 },
    )
  }

  const supabase = createClient(supabaseUrl, serviceKey)

  const sharpModernA3 = {
    name: "Sharp Modern A3",
    slug: "sharp-Modern-a3",
    image: "/product/sharp-Modern-a3-overview.png",
    images: [
      "/product/sharp-Modern-a3-overview.png",
      "/product/sharp-Modern-a3-parameters.png",
      "/product/sharp-Modern-a3-colours.png",
      "/product/sharp-Modern-a3-installation-accessories.png",
    ],
    led_type: "With LED",
    height: "80mm / 100mm / 120mm",
    height_value: 80,
    profile: "Buckle light strip (8/10/12CM)",
    power: "12V DC",
    features: ["Snap-on installation", "Integrated LED channel", "Aluminium", "2500mm length"],
    price: 89,
    description:
      "LED skirting board with integrated light strip. Aluminium profile in 80mm, 100mm or 120mm height. Black brushed, iron grey, white and rose gold finishes. Snap-on installation with end caps, corners and connectors.",
    category: "residential",
    seo_title: "Sharp Modern A3 LED Skirting Board | Innovation Skirting NZ",
    seo_description:
      "Sharp Modern A3 LED skirting board: aluminium profile with integrated LED strip in 80mm, 100mm or 120mm heights. Snap-on installation, black, iron grey, white and rose gold finishes. Best prices in NZ.",
    meta_keywords: ["LED skirting", "Sharp Modern A3", "RMS-A3", "aluminium skirting", "New Zealand"],
    in_stock: true,
    is_active: true,
  }

  const { data, error } = await supabase
    .from("products")
    .upsert(sharpModernA3, { onConflict: "slug" })
    .select()
    .single()

  if (error) {
    console.error("Seed error:", error)
    return NextResponse.json(
      { error: error.message, hint: "Ensure products table has an 'images' column (run ADD_IMAGES_COLUMN.sql if needed)." },
      { status: 500 },
    )
  }

  return NextResponse.json({ success: true, product: data })
}
