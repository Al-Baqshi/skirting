type ShopifyMoneyV2 = {
  amount: string
  currencyCode: string
}

type ShopifyImage = {
  url: string
  altText: string | null
}

type ShopifyProductNode = {
  id: string
  title: string
  handle: string
  description: string
  productType: string
  tags: string[]
  availableForSale: boolean
  images: { edges: Array<{ node: ShopifyImage }> }
  priceRange: { minVariantPrice: ShopifyMoneyV2 }
  seo: { title: string | null; description: string | null }
}

export type StorefrontProduct = {
  id: string
  name: string
  slug: string
  image: string
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

type ShopifyGraphQLError = {
  message: string
  locations?: Array<{ line: number; column: number }>
  path?: Array<string | number>
}

type ShopifyResponse<T> = {
  data?: T
  errors?: ShopifyGraphQLError[]
}

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION ?? "2025-01"

function getStorefrontEndpoint() {
  if (!SHOPIFY_STORE_DOMAIN) {
    throw new Error("Missing SHOPIFY_STORE_DOMAIN")
  }

  return `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`
}

async function shopifyFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  if (!SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
    throw new Error("Missing SHOPIFY_STOREFRONT_ACCESS_TOKEN")
  }

  const res = await fetch(getStorefrontEndpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_ACCESS_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Shopify request failed: ${res.status} ${text}`)
  }

  const json = (await res.json()) as ShopifyResponse<T>

  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join("\n"))
  }

  if (!json.data) {
    throw new Error("Shopify response missing data")
  }

  return json.data
}

function pickFromTags(tags: string[], prefixes: string[], fallback: string) {
  const lowerTags = tags.map((t) => t.trim())

  for (const prefix of prefixes) {
    const found = lowerTags.find((t) => t.toLowerCase().startsWith(prefix.toLowerCase()))
    if (found) return found.slice(prefix.length).trim()
  }

  return fallback
}

function normalizeCategory(productType: string, tags: string[]): StorefrontProduct["category"] {
  const source = `${productType} ${tags.join(" ")}`.toLowerCase()
  if (source.includes("smart") || source.includes("wifi") || source.includes("rgb")) return "smart"
  if (source.includes("commercial")) return "commercial"
  return "residential"
}

function parseHeightValue(height: string): number {
  const match = height.match(/(\d+)/)
  return match ? Number(match[1]) : 0
}

function mapShopifyProduct(node: ShopifyProductNode): StorefrontProduct {
  const image = node.images.edges[0]?.node.url ?? "/placeholder.svg"

  const ledType = pickFromTags(node.tags, ["LED:", "Led:", "led:"], "Warm White")
  const height = pickFromTags(node.tags, ["Height:", "height:"], "100mm")
  const profile = pickFromTags(node.tags, ["Profile:", "profile:"], "Standard")
  const power = pickFromTags(node.tags, ["Power:", "power:"], "")

  const features = node.tags
    .filter((t) => t.toLowerCase().startsWith("feature:"))
    .map((t) => t.slice("feature:".length).trim())

  const price = Number.parseFloat(node.priceRange.minVariantPrice.amount)

  return {
    id: node.id,
    name: node.title,
    slug: node.handle,
    image,
    ledType,
    height,
    heightValue: parseHeightValue(height),
    profile,
    power,
    features,
    price: Number.isFinite(price) ? price : 0,
    description: node.description,
    category: normalizeCategory(node.productType, node.tags),
    seoTitle: node.seo.title ?? undefined,
    seoDescription: node.seo.description ?? undefined,
    metaKeywords: node.tags.length ? node.tags : undefined,
    inStock: node.availableForSale,
  }
}

const PRODUCTS_QUERY = `
  query Products($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
          description
          productType
          tags
          availableForSale
          images(first: 1) {
            edges {
              node {
                url
                altText
              }
            }
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          seo {
            title
            description
          }
        }
      }
    }
  }
`

type ProductsQueryResult = {
  products: { edges: Array<{ node: ShopifyProductNode }> }
}

const PRODUCT_BY_HANDLE_QUERY = `
  query ProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      title
      handle
      description
      productType
      tags
      availableForSale
      images(first: 10) {
        edges {
          node {
            url
            altText
          }
        }
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      seo {
        title
        description
      }
    }
  }
`

type ProductByHandleQueryResult = {
  productByHandle: ShopifyProductNode | null
}

export async function getStorefrontProducts(first = 50): Promise<StorefrontProduct[]> {
  const data = await shopifyFetch<ProductsQueryResult>(PRODUCTS_QUERY, { first })
  return data.products.edges.map((e) => mapShopifyProduct(e.node))
}

export async function getStorefrontProductByHandle(handle: string): Promise<StorefrontProduct | null> {
  const data = await shopifyFetch<ProductByHandleQueryResult>(PRODUCT_BY_HANDLE_QUERY, { handle })
  if (!data.productByHandle) return null
  return mapShopifyProduct(data.productByHandle)
}
