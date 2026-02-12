-- Set colours for Bevel Clip A16 (run after 007_add_price_by_height_and_colors.sql).
-- Run in Supabase Dashboard → SQL Editor.

UPDATE public.products
SET colors = ARRAY[
  'Black',
  'Grey',
  'Vanilla White',
  'Apricot',
  'Dark grey',
  'Meridian grey',
  'Pale latte'
]::text[]
WHERE slug = 'bevel-clip-a16';
