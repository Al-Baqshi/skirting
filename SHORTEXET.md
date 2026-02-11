# Shortexet – Where You Are & What’s Next

**Last updated:** 2026-02-10

## Latest: Product restructure (first product)

- **Defined first product:** RMS-A3 → **Sharp Modern A3**
  - Display name: Sharp Modern A3  
  - Internal code: RMS-A3  
  - Catalogue line: 8/10/12CM buckle light strip  
  - Meta description: pre-written in `lib/product-catalog.ts`
- **Product catalog:** `lib/product-catalog.ts` – add new products here (display name, internal code, meta description, section labels).
- **Client product view:** 4 sections when product is in catalog and has 4 images in order:
  1. **Overview** – main product visual  
  2. **Product parameters** – sizes, material, length  
  3. **Colours** – off/on light effect  
  4. **Installation & accessories** – front installation + accessories  
- **Navigation:** Prev/next product links at bottom of each product page; “Back to Products” and “View All Products” for easy movement.
- **Meta:** Product page uses catalog `metaDescription` for SEO when present; `generateMetadata` in `app/products/[slug]/page.tsx`.
- **Assets:** Sharp Modern A3 images copied to `public/product/`:
  - `sharp-Modern-a3-overview.png`
  - `sharp-Modern-a3-parameters.png`
  - `sharp-Modern-a3-colours.png`
  - `sharp-Modern-a3-installation-accessories.png`
- **Seed:** `scripts/seed-sharp-Modern-a3.sql` – run in Supabase to create/update Sharp Modern A3 (ensure `images` column exists via `ADD_IMAGES_COLUMN.sql` first).

## Where you left off

- First product (Sharp Modern A3) is **defined and wired** in code and assets.  
- You can create it in the DB by running `scripts/seed-sharp-Modern-a3.sql` in Supabase, or add it manually in Admin → Products with the same name, slug `sharp-Modern-a3`, and the 4 images in the order above.

## Next actions

1. **Run seed (if using Supabase):** Execute `ADD_IMAGES_COLUMN.sql` if needed, then `scripts/seed-sharp-Modern-a3.sql`.  
2. **Or add via Admin:** Go to `/admin/products` → Add Product → Name “Sharp Modern A3”, slug `sharp-Modern-a3`, add the 4 image URLs/paths in order (Overview, Parameters, Colours, Installation & accessories).  
3. **Add more products:** For each new product (e.g. RMS-A7, RMS-A8…):  
   - Add an entry in `lib/product-catalog.ts` (display name, internal code, meta description).  
   - Create the product in DB (admin or SQL) with 4 images in the same section order.  
   - Client view and meta will pick it up automatically.

## Key files

- `lib/product-catalog.ts` – product display names, codes, meta, section labels  
- `app/products/[slug]/page.tsx` – server page, fetch product + metadata  
- `app/products/[slug]/ProductViewClient.tsx` – 4-section or legacy layout, order card, prev/next  
- `scripts/seed-sharp-Modern-a3.sql` – seed first product  
- `public/product/sharp-Modern-a3-*.png` – first product images
