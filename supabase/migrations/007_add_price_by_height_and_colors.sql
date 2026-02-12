-- REQUIRED for colours to save and show:
-- Run this entire file in Supabase Dashboard → SQL Editor → New query → Paste → Run.
-- Until this is run, the "colors" column does not exist, so:
--   - Admin: colours you add in the form will NOT be saved (API falls back to save without them).
--   - Storefront: product colour selection will show "—" because product.colors is empty.
-- After running: re-save each product in Admin (edit → add colours → Save) so colours persist and appear on the site.
--
-- 1) Price per height (per size) in admin and storefront
-- 2) Product colours: admin adds colour names per product; customers select colour when adding to cart; colour appears in quote/order
-- Price per height (keys: "30", "40", "50", "60", "80", "260" = 3cm–26cm). Fallback: use products.price.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'price_by_height'
  ) THEN
    ALTER TABLE public.products ADD COLUMN price_by_height JSONB DEFAULT NULL;
  END IF;
END $$;

-- Product colors (e.g. Black, White, Grey)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'colors'
  ) THEN
    ALTER TABLE public.products ADD COLUMN colors TEXT[] DEFAULT '{}';
  END IF;
END $$;
