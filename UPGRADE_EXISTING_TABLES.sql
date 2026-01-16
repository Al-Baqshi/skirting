-- ============================================================================
-- UPGRADE EXISTING TABLES - Add Missing Columns
-- ============================================================================
-- Run this FIRST if you already have the products table from the first migration
-- This adds the missing columns: is_active, created_by, updated_by
-- ============================================================================

-- Add missing columns to products table (if they don't exist)
DO $$ 
BEGIN
  -- Add is_active column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'is_active'
  ) THEN
    ALTER TABLE public.products ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;

  -- Add created_by column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'created_by'
  ) THEN
    ALTER TABLE public.products ADD COLUMN created_by UUID REFERENCES auth.users(id);
  END IF;

  -- Add updated_by column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'updated_by'
  ) THEN
    ALTER TABLE public.products ADD COLUMN updated_by UUID REFERENCES auth.users(id);
  END IF;

  -- Make price NOT NULL (if it's nullable)
  ALTER TABLE public.products ALTER COLUMN price SET NOT NULL;
  
  -- Set default for existing rows
  UPDATE public.products SET is_active = true WHERE is_active IS NULL;
END $$;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON public.products(in_stock);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- Verify columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'products'
ORDER BY ordinal_position;
