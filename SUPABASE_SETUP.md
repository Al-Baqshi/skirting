# Supabase Setup Guide

## Issue
The application is trying to fetch products from Supabase, but the `public.products` table doesn't exist yet.

## Solution

### Option 1: Create the Table in Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the following SQL:

```sql
-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  image TEXT,
  led_type TEXT,
  height TEXT,
  height_value INTEGER,
  profile TEXT,
  power TEXT,
  features TEXT[] DEFAULT '{}',
  price DECIMAL(10, 2),
  description TEXT,
  category TEXT CHECK (category IN ('residential', 'smart', 'commercial')),
  seo_title TEXT,
  seo_description TEXT,
  meta_keywords TEXT[] DEFAULT '{}',
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON public.products
  FOR SELECT
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Reload PostgREST schema
NOTIFY pgrst, 'reload schema';
```

4. After running the SQL, verify the table exists by checking the **Table Editor** in Supabase

### Option 2: Use Supabase CLI

If you have Supabase CLI set up locally:

```bash
# Apply the migration
supabase db push

# Or run the migration file directly
supabase migration up
```

The migration file is located at: `supabase/migrations/001_create_products_table.sql`

## Verify Setup

1. Check that the table exists in Supabase Dashboard → Table Editor
2. Verify that the `public` schema is exposed in Supabase Settings → API
3. Test the API endpoint: `/api/products` should return products (or default products if table is empty)

## Current Behavior

- **If Supabase table exists**: Products are fetched from Supabase
- **If Supabase table doesn't exist**: The API automatically falls back to default products from `lib/products.ts`

This ensures the application works even if the Supabase table hasn't been created yet.

## Adding Products to Supabase

Once the table is created, you can add products via:

1. **Supabase Dashboard**: Use the Table Editor to manually add rows
2. **SQL**: Insert products directly via SQL Editor
3. **API**: Create an admin API endpoint to insert products (future enhancement)

Example SQL insert:

```sql
INSERT INTO public.products (
  name, slug, image, led_type, height, height_value, profile, power, 
  features, price, description, category, seo_title, seo_description, 
  meta_keywords, in_stock
) VALUES (
  'SK-100 Classic',
  'sk-100-classic',
  '/aluminium-skirting-board-with-warm-led-light.jpg',
  'Warm White',
  '100mm',
  100,
  'Slim',
  '12V DC',
  ARRAY['Motion Sensor', 'Dimmable'],
  89.00,
  'Perfect for residential spaces. Clean lines with warm ambient lighting.',
  'residential',
  'SK-100 Classic Skirting Board - Premium LED Skirting in New Zealand',
  'Discover the SK-100 Classic skirting board with integrated warm white LED lighting.',
  ARRAY['skirting board', 'LED skirting', 'New Zealand'],
  true
);
```
