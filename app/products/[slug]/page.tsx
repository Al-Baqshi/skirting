import { notFound } from "next/navigation"
import { getSupabaseProductBySlug, getSupabaseProducts } from "@/lib/supabase-products"
import { getProductCatalogEntry } from "@/lib/product-catalog"
import { ProductViewClient } from "./ProductViewClient"
import type { Metadata } from "next"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  if (!slug) return { title: "Skirting Boards | Innovation Skirting NZ" }

  const product = await getSupabaseProductBySlug(slug, true).catch(() => null)
  const catalogEntry = getProductCatalogEntry(slug)

  if (!product) return { title: "Skirting Boards | Innovation Skirting NZ" }

  const name = catalogEntry?.displayName ?? product.name
  const title = name.toLowerCase().includes("skirting") ? name : `${name} Skirting Board`
  const description =
    catalogEntry?.metaDescription ?? product.seoDescription ?? product.description ?? undefined
  const metaDesc = description ?? `${title} - premium skirting boards in New Zealand. Best prices, LED and aluminium options. Innovation Skirting NZ.`

  return {
    title: `${title} | Innovation Skirting NZ`,
    description: metaDesc,
    openGraph: {
      title: `${title} | Innovation Skirting NZ`,
      description: metaDesc,
      type: "website",
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  if (!slug) notFound()

  let product = await getSupabaseProductBySlug(slug, false).catch(() => null)
  if (!product) product = await getSupabaseProductBySlug(slug, true).catch(() => null)
  const allProducts = await getSupabaseProducts(100, true)

  if (!product) notFound()

  const catalogEntry = getProductCatalogEntry(slug)

  return (
    <ProductViewClient
      product={product}
      allProducts={allProducts}
      catalogEntry={catalogEntry}
    />
  )
}
