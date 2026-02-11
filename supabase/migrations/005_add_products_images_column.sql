-- Add images column for multiple product images (5 slots: Main, Params, Install, Accessories, Colours)
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

    UPDATE public.products
    SET images = ARRAY[image]
    WHERE image IS NOT NULL AND image != '';
  END IF;
END $$;
