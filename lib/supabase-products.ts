export type StorefrontProduct = {
  id: string
  name: string
  slug: string
  image: string
  images?: string[] // Multiple images support
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
  profile: string | null
  power: string | null
  features: string[] | null
  price: number | null
  description: string | null
  category: string | null
  seo_title: string | null
  seo_description: string | null
  meta_keywords: string[] | null
  in_stock: boolean | null
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

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

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    image: row.image ?? "/placeholder.svg",
    images: row.images ?? undefined,
    ledType: row.led_type ?? "",
    height: row.height ?? "",
    heightValue: row.height_value ?? 0,
    profile: row.profile ?? "",
    power: row.power ?? "",
    features: row.features ?? [],
    price: row.price ?? 0,
    description: row.description ?? "",
    category: normalizedCategory,
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
  "id,name,slug,image,images,led_type,height,height_value,profile,power,features,price,description,category,seo_title,seo_description,meta_keywords,in_stock,is_active"

export async function getSupabaseProducts(limit = 50, includeInactive = false): Promise<StorefrontProduct[]> {
  let query = `products?select=${encodeURIComponent(SELECT_COLUMNS)}&order=name.asc&limit=${limit}`
  
  // If not including inactive, filter by is_active
  if (!includeInactive) {
    query += `&is_active=eq.true`
  }
  
  const rows = await supabaseRest<DbProduct[]>(query)

  return rows.map(mapDbProduct)
}

export async function getSupabaseProductBySlug(slug: string, includeInactive = false): Promise<StorefrontProduct | null> {
  try {
    let query = `products?select=${encodeURIComponent(SELECT_COLUMNS)}&slug=eq.${encodeURIComponent(slug)}&limit=1`
    
    // If not including inactive, filter by is_active
    if (!includeInactive) {
      query += `&is_active=eq.true`
    }
    
    const rows = await supabaseRest<DbProduct[]>(query)

    const first = rows[0]
    return first ? mapDbProduct(first) : null
  } catch (error) {
    console.error("Error fetching product by slug:", slug, error)
    return null
  }
}
