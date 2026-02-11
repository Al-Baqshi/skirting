/**
 * Product catalog: maps slugs to display names, internal codes (e.g. RMS-A3),
 * meta descriptions, and the four client-view sections (Overview, Parameters, Colors, Accessories).
 * Add new products here as you restructure from the reference PDF.
 */

export const PRODUCT_SECTIONS_5 = [
  "Main product image",
  "Product parameters",
  "Front installation illustration",
  "Accessories",
  "Colours",
] as const

export const PRODUCT_SECTIONS = [
  "Overview",
  "Product parameters",
  "Colours",
  "Installation & accessories",
] as const

export type ProductSectionKey = (typeof PRODUCT_SECTIONS)[number]

export type ProductCatalogEntry = {
  /** Display name (e.g. "Sharp Sodern A3") */
  displayName: string
  /** Internal / factory code (e.g. "RMS-A3") */
  internalCode: string
  /** Short line from catalogue (e.g. "8/10/12CM buckle light strip") */
  catalogueLine?: string
  /** Meta description for SEO (already written to save time) */
  metaDescription: string
  /** Section labels for the 5-part client view (optional overrides) */
  sectionLabels?: readonly [string, string, string, string, string]
}

const catalog: Record<string, ProductCatalogEntry> = {
  "sharp-sodern-a3": {
    displayName: "Sharp Sodern A3",
    internalCode: "RMS-A3",
    catalogueLine: "8/10/12CM buckle light strip",
    metaDescription: "Sharp Sodern A3 LED skirting board: aluminium profile with integrated LED strip in 80mm, 100mm or 120mm heights. Snap-on installation. Best prices in NZ.",
    sectionLabels: ["Main product image", "Product parameters", "Front installation illustration", "Accessories", "Colours"],
  },
  "sharp-slim-a7": {
    displayName: "Sharp Slim A7",
    internalCode: "RMS-A7",
    catalogueLine: "5CM buckle light strip",
    metaDescription: "Sharp Slim A7 5cm LED skirting board with buckle light strip. Compact aluminium profile. Best prices in NZ.",
    sectionLabels: ["Main product image", "Product parameters", "Front installation illustration", "Accessories", "Colours"],
  },
  "inset-led-a8": {
    displayName: "Inset LED A8",
    internalCode: "RMS-A8",
    catalogueLine: "Built-in light strip",
    metaDescription: "Inset LED A8 skirting board with recessed light strip channel. Flush aluminium profile. Best prices in NZ.",
    sectionLabels: ["Main product image", "Product parameters", "Front installation illustration", "Accessories", "Colours"],
  },
  "surface-led-a9": {
    displayName: "Surface LED A9",
    internalCode: "RMS-A9",
    catalogueLine: "Surface-mounted light strip",
    metaDescription: "Surface LED A9 skirting board with surface-mounted light strip. Easy installation. Best prices in NZ.",
    sectionLabels: ["Main product image", "Product parameters", "Front installation illustration", "Accessories", "Colours"],
  },
  "curve-led-a12": {
    displayName: "Curve LED A12",
    internalCode: "RMS-A12",
    catalogueLine: "Curved light strip",
    metaDescription: "Curve LED A12 curved LED skirting board. Integrated light strip for curved walls. Best prices in NZ.",
    sectionLabels: ["Main product image", "Product parameters", "Front installation illustration", "Accessories", "Colours"],
  },
  "elegant-led-a32": {
    displayName: "Elegant LED A32",
    internalCode: "RMS-A32",
    catalogueLine: "Elegant light strip",
    metaDescription: "Elegant LED A32 skirting board with refined light strip. Premium aluminium. Best prices in NZ.",
    sectionLabels: ["Main product image", "Product parameters", "Front installation illustration", "Accessories", "Colours"],
  },
  "up-glow-a36": {
    displayName: "Up Glow A36",
    internalCode: "RMS-A36",
    catalogueLine: "Upward-emitting buckle",
    metaDescription: "Up Glow A36 skirting board with upward-emitting LED. Ambient ceiling wash. Best prices in NZ.",
    sectionLabels: ["Main product image", "Product parameters", "Front installation illustration", "Accessories", "Colours"],
  },
  "up-glow-a36-duplicate": {
    displayName: "Up Glow A36 (Duplicate)",
    internalCode: "RMS-A36",
    catalogueLine: "Upward-emitting buckle",
    metaDescription: "Up Glow A36 skirting board duplicate with upward-emitting LED. Ambient ceiling wash. Best prices in NZ.",
    sectionLabels: ["Main product image", "Product parameters", "Front installation illustration", "Accessories", "Colours"],
  },
  "led-light-strip": {
    displayName: "LED Light Strip",
    internalCode: "",
    catalogueLine: "Light strip accessory",
    metaDescription: "LED light strip for skirting boards. Flexible, dimmable. Compatible with all our LED skirting profiles. Best prices in NZ.",
    sectionLabels: ["Main product image", "Product parameters", "Front installation illustration", "Accessories", "Colours"],
  },
  "transformer-wiring": {
    displayName: "Transformer & Wiring",
    internalCode: "",
    catalogueLine: "Transformer and wiring",
    metaDescription: "Transformer and wiring for LED skirting boards. Full compatibility. Best prices in NZ.",
    sectionLabels: ["Main product image", "Product parameters", "Front installation illustration", "Accessories", "Colours"],
  },
  "classic-clip-a1": {
    displayName: "Classic Clip A1",
    internalCode: "RMS-A1",
    catalogueLine: "Classic buckle",
    metaDescription: "Classic Clip A1 skirting board with buckle clips. Timeless design. Best prices in NZ.",
    sectionLabels: ["Main product image", "Product parameters", "Front installation illustration", "Accessories", "Colours"],
  },
  "minimal-adhesive-a2": {
    displayName: "Minimal Adhesive A2",
    internalCode: "RMS-A2",
    catalogueLine: "Minimal adhesive",
    metaDescription: "Minimal Adhesive A2 skirting board. Adhesive installation, minimal profile. Best prices in NZ.",
    sectionLabels: ["Main product image", "Product parameters", "Front installation illustration", "Accessories", "Colours"],
  },
  "recessed-a4": {
    displayName: "Recessed A4",
    internalCode: "RMS-A4",
    catalogueLine: "Recessed installation",
    metaDescription: "Recessed A4 skirting board for flush installation. Clean integrated look. Best prices in NZ.",
    sectionLabels: ["Main product image", "Product parameters", "Front installation illustration", "Accessories", "Colours"],
  },
  "luxe-clip-a5": {
    displayName: "Luxe Clip A5",
    internalCode: "RMS-A5",
    catalogueLine: "Luxe buckle",
    metaDescription: "Luxe Clip A5 skirting with premium buckle design. Sophisticated profile. Best prices in NZ.",
    sectionLabels: ["Main product image", "Product parameters", "Front installation illustration", "Accessories", "Colours"],
  },
  "natural-wood-a5n": {
    displayName: "Natural Wood A5N",
    internalCode: "RMS-A5N",
    catalogueLine: "Natural wood look",
    metaDescription: "Natural Wood A5N skirting with wood-effect finish. Clip design. Best prices in NZ.",
    sectionLabels: ["Main product image", "Product parameters", "Front installation illustration", "Accessories", "Colours"],
  },
  "luxe-thick-a39": {
    displayName: "Luxe Thick A39",
    internalCode: "RMS-A39",
    catalogueLine: "Luxe extra-thick",
    metaDescription: "Luxe Thick A39 extra-thick skirting board. Premium aluminium. Best prices in NZ.",
    sectionLabels: ["Main product image", "Product parameters", "Front installation illustration", "Accessories", "Colours"],
  },
  "diamond-clip-a13": {
    displayName: "Diamond Clip A13",
    internalCode: "RMS-A13",
    catalogueLine: "Diamond buckle",
    metaDescription: "Diamond Clip A13 skirting with diamond buckle profile. Statement design. Best prices in NZ.",
    sectionLabels: ["Main product image", "Product parameters", "Front installation illustration", "Accessories", "Colours"],
  },
  "bevel-clip-a16": {
    displayName: "Bevel Clip A16",
    internalCode: "RMS-A16",
    catalogueLine: "Beveled buckle",
    metaDescription: "Bevel Clip A16 skirting with beveled buckle. Angular design. Best prices in NZ.",
    sectionLabels: ["Main product image", "Product parameters", "Front installation illustration", "Accessories", "Colours"],
  },
  "stainless-a18": {
    displayName: "Stainless A18",
    internalCode: "RMS-A18",
    catalogueLine: "Stainless steel",
    metaDescription: "Stainless A18 stainless steel skirting board. Commercial grade. Best prices in NZ.",
    sectionLabels: ["Main product image", "Product parameters", "Front installation illustration", "Accessories", "Colours"],
  },
  "slim-2cm-a19": {
    displayName: "Slim 2cm A19",
    internalCode: "RMS-A19",
    catalogueLine: "2CM ultra-slim",
    metaDescription: "Slim 2cm A19 ultra-slim skirting board. Minimal profile. Best prices in NZ.",
    sectionLabels: ["Main product image", "Product parameters", "Front installation illustration", "Accessories", "Colours"],
  },
  "seamless-edge-a20": {
    displayName: "Seamless Edge A20",
    internalCode: "RMS-A20",
    catalogueLine: "Seamless straight edge",
    metaDescription: "Seamless Edge A20 skirting with seamless joints. Clean lines. Best prices in NZ.",
    sectionLabels: ["Main product image", "Product parameters", "Front installation illustration", "Accessories", "Colours"],
  },
  "double-clip-a33": {
    displayName: "Double Clip A33",
    internalCode: "RMS-A33",
    catalogueLine: "Double-layer buckle",
    metaDescription: "Double Clip A33 skirting with double-layer buckle. Robust design. Best prices in NZ.",
    sectionLabels: ["Main product image", "Product parameters", "Front installation illustration", "Accessories", "Colours"],
  },
  "curve-edge-a34": {
    displayName: "Curve Edge A34",
    internalCode: "RMS-A34",
    catalogueLine: "Curved straight edge",
    metaDescription: "Curve Edge A34 curved skirting with straight edge. For curved walls. Best prices in NZ.",
    sectionLabels: ["Main product image", "Product parameters", "Front installation illustration", "Accessories", "Colours"],
  },
}

export function getProductCatalogEntry(slug: string): ProductCatalogEntry | null {
  const normalized = slug.toLowerCase().replace(/\s+/g, "-")
  return catalog[normalized] ?? null
}

/** Returns 5 section labels when using 5-part product view. */
export function getProductSectionLabels5(slug: string): readonly [string, string, string, string, string] {
  const entry = getProductCatalogEntry(slug)
  if (entry?.sectionLabels && entry.sectionLabels.length >= 5) return entry.sectionLabels as readonly [string, string, string, string, string]
  return PRODUCT_SECTIONS_5
}

export function getProductSectionLabels(slug: string): readonly [string, string, string, string] {
  const five = getProductSectionLabels5(slug)
  return [five[0], five[1], five[3], five[4]]
}

/** All slugs that use the 4-section product view. */
export function getFourSectionSlugs(): string[] {
  return Object.keys(catalog)
}
