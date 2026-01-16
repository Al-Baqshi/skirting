import { NextResponse } from "next/server"
import { getSupabaseProductBySlug } from "@/lib/supabase-products"

export async function GET(_request: Request, context: { params: Promise<{ handle: string }> }) {
  try {
    const { handle } = await context.params
    const product = await getSupabaseProductBySlug(handle)

    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
