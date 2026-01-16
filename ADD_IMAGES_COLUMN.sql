-- ============================================================================
-- ADD IMAGES COLUMN TO PRODUCTS TABLE
-- ============================================================================
-- Run this in your Supabase SQL Editor to enable multiple images per product
-- ============================================================================

-- Add images column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'images'
  ) THEN
    ALTER TABLE public.products 
    ADD COLUMN images TEXT[] DEFAULT '{}';
    
    -- Migrate existing image data to images array
    UPDATE public.products 
    SET images = ARRAY[image] 
    WHERE image IS NOT NULL AND image != '';
    
    RAISE NOTICE 'Images column added successfully';
  ELSE
    RAISE NOTICE 'Images column already exists';
  END IF;
END $$;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
