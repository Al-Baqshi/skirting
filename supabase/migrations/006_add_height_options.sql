-- Add height_options for multi-select (40, 60, 80 = 4cm, 6cm, 8cm)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'products'
    AND column_name = 'height_options'
  ) THEN
    ALTER TABLE public.products
    ADD COLUMN height_options INTEGER[] DEFAULT '{40, 60, 80}';

    UPDATE public.products
    SET height_options = '{40, 60, 80}'
    WHERE height_options IS NULL;
  END IF;
END $$;
