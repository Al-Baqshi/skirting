export type StorefrontProduct = {
  id: string
  name: string
  slug: string
  image: string
  images?: string[] // Multiple images support
  ledType: string
  height: string
  heightValue: number
  heightOptions?: number[] // Multi-select: 30,40,50,60,70,80,90,100,260 (3–10cm, 26cm). Default all.
  profile: string
  power: string
  features: string[]
  price: number
  /** Price per height (key = height value as string e.g. "30" for 3cm). Use getPriceForHeight(product, height) for storefront. */
  priceByHeight?: Record<string, number>
  description: string
  category: "residential" | "smart" | "commercial"
  colors?: string[]
  seoTitle?: string
  seoDescription?: string
  metaKeywords?: string[]
  inStock?: boolean
}

type DbProduct = {
  id: string
  name: string
  slug: string
  image: string | null
  images: string[] | null
  led_type: string | null
  height: string | null
  height_value: number | null
  height_options: number[] | null
  profile: string | null
  power: string | null
  features: string[] | null
  price: number | null
  price_by_height: Record<string, number> | null
  description: string | null
  category: string | null
  colors: string[] | null
  seo_title: string | null
  seo_description: string | null
  meta_keywords: string[] | null
  in_stock: boolean | null
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

/**
 * Converts old product image paths (e.g. /product/folder/1.png) to new SEO naming
 * (/product/folder/folder-skirting-1.png). Idempotent: already-correct paths pass through.
 */
function normalizeProductImagePath(path: string | null | undefined): string {
  if (!path || typeof path !== "string" || !path.trim()) return "/placeholder.svg"
  const trimmed = path.trim()
  if (!trimmed.startsWith("/product/") || trimmed.startsWith("http")) return trimmed
  const match = trimmed.match(/^\/product\/([^/]+)\/([1-5])\.(png|jpg|jpeg|webp)$/i)
  if (match) {
    const [, folder, num, ext] = match
    return `/product/${folder}/${folder}-skirting-${num}.${ext.toLowerCase()}`
  }
  return trimmed
}

function assertEnv() {
  if (!SUPABASE_URL) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL")
  if (!SUPABASE_ANON_KEY && !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY)")
  }
}

function mapDbProduct(row: DbProduct): StorefrontProduct {
  const category = (row.category ?? "residential").toLowerCase()
  const normalizedCategory: StorefrontProduct["category"] =
    category === "smart" ? "smart" : category === "commercial" ? "commercial" : "residential"

  const rawImages = row.images ?? []
  const normalizedImages = Array.isArray(rawImages)
    ? rawImages.map((p) => (p && String(p).trim() ? normalizeProductImagePath(p) : ""))
    : undefined

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    image: (row.image && String(row.image).trim() ? normalizeProductImagePath(row.image) : null) ?? "/placeholder.svg",
    images: normalizedImages && normalizedImages.length > 0 ? normalizedImages : undefined,
    ledType: row.led_type ?? "",
    height: row.height ?? "",
    heightValue: row.height_value ?? 0,
    heightOptions:
      Array.isArray(row.height_options) && row.height_options.length > 0
        ? row.height_options
        : [12, 20, 30, 40, 46, 50, 60, 65, 70, 80, 90, 100, 260],
    profile: row.profile ?? "",
    power: row.power ?? "",
    features: row.features ?? [],
    price: row.price ?? 0,
    priceByHeight:
      row.price_by_height && typeof row.price_by_height === "object" && Object.keys(row.price_by_height).length > 0
        ? row.price_by_height
        : undefined,
    description: row.description ?? "",
    category: normalizedCategory,
    colors:
      Array.isArray(row.colors) && row.colors.length > 0
        ? row.colors.filter((c): c is string => typeof c === "string" && c.trim() !== "")
        : undefined,
    seoTitle: row.seo_title ?? undefined,
    seoDescription: row.seo_description ?? undefined,
    metaKeywords: row.meta_keywords ?? undefined,
    inStock: row.in_stock ?? undefined,
  }
}

async function supabaseRest<T>(pathAndQuery: string): Promise<T> {
  assertEnv()

  const apiKey = SUPABASE_SERVICE_ROLE_KEY ?? SUPABASE_ANON_KEY!

  const res = await fetch(`${SUPABASE_URL}/rest/v1/${pathAndQuery}`, {
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
    },
    cache: "no-store",
  })

  if (!res.ok) {
    const text = await res.text()

    let hint = ""
    try {
      const parsed = JSON.parse(text) as { code?: string; message?: string }
      if (parsed.code === "PGRST205") {
        hint =
          " Hint: PostgREST cannot see the table. Ensure `public.products` exists, `public` is an exposed schema in Supabase Settings → API, and run `select pg_notify('pgrst','reload schema');` after creating the table."
      }
    } catch {
      // ignore
    }

    throw new Error(
      `Supabase request failed: ${res.status} ${text} (request: /rest/v1/${pathAndQuery}).${hint}`,
    )
  }

  return (await res.json()) as T
}

const SELECT_COLUMNS =
  "id,name,slug,image,images,led_type,height,height_value,height_options,profile,power,features,price,price_by_height,description,category,colors,seo_title,seo_description,meta_keywords,in_stock,is_active"

/** Select list without price_by_height and colors for DBs that haven't run migration 007 */
const SELECT_COLUMNS_LEGACY =
  "id,name,slug,image,images,led_type,height,height_value,height_options,profile,power,features,price,description,category,seo_title,seo_description,meta_keywords,in_stock,is_active"

export async function getSupabaseProducts(limit = 50, includeInactive = false): Promise<StorefrontProduct[]> {
  const orderAndFilter = `&order=name.asc&limit=${limit}${includeInactive ? "" : "&is_active=eq.true"}`
  try {
    const query = `products?select=${encodeURIComponent(SELECT_COLUMNS)}${orderAndFilter}`
    const rows = await supabaseRest<DbProduct[]>(query)
    return rows.map(mapDbProduct)
  } catch {
    const queryLegacy = `products?select=${encodeURIComponent(SELECT_COLUMNS_LEGACY)}${orderAndFilter}`
    const rows = await supabaseRest<DbProduct[]>(queryLegacy)
    return rows.map(mapDbProduct)
  }
}

/** Get price per meter for a given height. Uses priceByHeight if set, else product.price. */
export function getPriceForHeight(product: StorefrontProduct, heightValue: number): number {
  const key = String(heightValue)
  const byHeight = product.priceByHeight && product.priceByHeight[key]
  if (typeof byHeight === "number" && byHeight >= 0) return byHeight
  return product.price ?? 0
}

export async function getSupabaseProductBySlug(slug: string, includeInactive = false): Promise<StorefrontProduct | null> {
  const slugFilter = `&slug=eq.${encodeURIComponent(slug)}&limit=1${includeInactive ? "" : "&is_active=eq.true"}`
  try {
    const query = `products?select=${encodeURIComponent(SELECT_COLUMNS)}${slugFilter}`
    const rows = await supabaseRest<DbProduct[]>(query)
    const first = rows[0]
    return first ? mapDbProduct(first) : null
  } catch {
    try {
      const queryLegacy = `products?select=${encodeURIComponent(SELECT_COLUMNS_LEGACY)}${slugFilter}`
      const rows = await supabaseRest<DbProduct[]>(queryLegacy)
      const first = rows[0]
      return first ? mapDbProduct(first) : null
    } catch (error) {
      console.error("Error fetching product by slug:", slug, error)
      return null
    }
  }
}
