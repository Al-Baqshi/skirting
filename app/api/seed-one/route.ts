import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

/**
 * Seeds a single product by slug. Call: POST /api/seed-one?slug=up-glow-a36&key=skirting-seed
 */
const PRODUCT_BY_SLUG: Record<string, Record<string, unknown>> = {
  "up-glow-a36": {
    name: "Up Glow A36",
    slug: "up-glow-a36",
    image: "/product/up-glow-a36/up-glow-a36-skirting-1.png",
    images: [
      "/product/up-glow-a36/up-glow-a36-skirting-1.png",
      "/product/up-glow-a36/up-glow-a36-skirting-2.png",
      "/product/up-glow-a36/up-glow-a36-skirting-3.png",
      "/product/up-glow-a36/up-glow-a36-skirting-4.png",
      "/product/up-glow-a36/up-glow-a36-skirting-5.png",
    ],
    led_type: "With LED",
    height: "3cm / 4cm / 5cm / 6cm / 8cm / 26cm",
    height_value: 50,
    height_options: [12, 20, 30, 40, 46, 50, 60, 65, 70, 80, 90, 100, 260],
    profile: "Upward-emitting buckle",
    power: "12V DC",
    features: ["Upward glow", "Buckle design", "Ambient lighting"],
    price: 20,
    description:
      "Up Glow A36 skirting with upward-emitting LED for ambient ceiling wash. Buckle profile for easy installation.",
    category: "residential",
    seo_title: "Up Glow A36 LED Skirting Board | Innovation Skirting NZ",
    seo_description:
      "Up Glow A36 skirting board with upward-emitting LED. Ambient ceiling wash. Best prices in NZ.",
    meta_keywords: ["upward LED skirting", "RMS-A36", "ambient skirting", "New Zealand"],
    in_stock: true,
    is_active: true,
  },
  "up-glow-a36-duplicate": {
    name: "Up Glow A36 (Duplicate)",
    slug: "up-glow-a36-duplicate",
    image: "/product/up-glow-a36/up-glow-a36-skirting-1.png",
    images: [
      "/product/up-glow-a36/up-glow-a36-skirting-1.png",
      "/product/up-glow-a36/up-glow-a36-skirting-2.png",
      "/product/up-glow-a36/up-glow-a36-skirting-3.png",
      "/product/up-glow-a36/up-glow-a36-skirting-4.png",
      "/product/up-glow-a36/up-glow-a36-skirting-5.png",
    ],
    led_type: "With LED",
    height: "3cm / 4cm / 5cm / 6cm / 8cm / 26cm",
    height_value: 50,
    height_options: [12, 20, 30, 40, 46, 50, 60, 65, 70, 80, 90, 100, 260],
    profile: "Upward-emitting buckle",
    power: "12V DC",
    features: ["Upward glow", "Buckle design", "Ambient lighting"],
    price: 20,
    description:
      "Up Glow A36 skirting with upward-emitting LED for ambient ceiling wash. Buckle profile for easy installation. (Duplicate)",
    category: "residential",
    seo_title: "Up Glow A36 LED Skirting Board (Duplicate) | Innovation Skirting NZ",
    seo_description:
      "Up Glow A36 skirting board with upward-emitting LED. Ambient ceiling wash. Best prices in NZ.",
    meta_keywords: ["upward LED skirting", "RMS-A36", "ambient skirting", "New Zealand"],
    in_stock: true,
    is_active: true,
  },
}

export async function POST(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key") ?? process.env.SEED_KEY
  if (key !== "skirting-seed" && !process.env.SEED_KEY) {
    return NextResponse.json({ error: "Missing or invalid seed key. Use ?key=skirting-seed" }, { status: 401 })
  }

  const slug = request.nextUrl.searchParams.get("slug") ?? "up-glow-a36-duplicate"
  const product = PRODUCT_BY_SLUG[slug]

  if (!product) {
    return NextResponse.json(
      { error: `Product "${slug}" not found. Available: ${Object.keys(PRODUCT_BY_SLUG).join(", ")}` },
      { status: 404 },
    )
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

  const { data, error } = await supabase.from("products").upsert(product, { onConflict: "slug" }).select("id").single()

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, slug, id: data?.id })
}
