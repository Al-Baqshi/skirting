-- ============================================================================
-- SEED: Sharp Modern A3 (first restructured product, RMS-A3)
-- ============================================================================
-- Run in Supabase SQL Editor after ensuring:
-- 1. products table exists and has column: images TEXT[] (run ADD_IMAGES_COLUMN.sql if needed)
-- 2. Images are in place under public/product/ (or use URLs you host)
-- ============================================================================

INSERT INTO public.products (
  name,
  slug,
  image,
  images,
  led_type,
  height,
  height_value,
  profile,
  power,
  features,
  price,
  description,
  category,
  seo_title,
  seo_description,
  meta_keywords,
  in_stock,
  is_active
) VALUES (
  'Sharp Modern A3',
  'sharp-Modern-a3',
  '/product/sharp-Modern-a3-overview.png',
  ARRAY[
    '/product/sharp-Modern-a3-overview.png',
    '/product/sharp-Modern-a3-parameters.png',
    '/product/sharp-Modern-a3-colours.png',
    '/product/sharp-Modern-a3-installation-accessories.png'
  ],
  'With LED',
  '80mm / 100mm / 120mm',
  80,
  'Buckle light strip (8/10/12CM)',
  '12V DC',
  ARRAY['Snap-on installation', 'Integrated LED channel', 'Aluminium', '2500mm length'],
  89,
  'LED skirting board with integrated light strip. Aluminium profile in 80mm, 100mm or 120mm height. Black brushed, iron grey, white and rose gold finishes. Snap-on installation with end caps, corners and connectors.',
  'residential',
  'Sharp Modern A3 LED Skirting Board | Innovation Skirting NZ',
  'Sharp Modern A3 LED skirting board: aluminium profile with integrated LED strip in 80mm, 100mm or 120mm heights. Snap-on installation, black, iron grey, white and rose gold finishes. Best prices in NZ.',
  ARRAY['LED skirting', 'Sharp Modern A3', 'RMS-A3', 'aluminium skirting', 'New Zealand'],
  true,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  led_type = EXCLUDED.led_type,
  height = EXCLUDED.height,
  height_value = EXCLUDED.height_value,
  profile = EXCLUDED.profile,
  power = EXCLUDED.power,
  features = EXCLUDED.features,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  meta_keywords = EXCLUDED.meta_keywords,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();
