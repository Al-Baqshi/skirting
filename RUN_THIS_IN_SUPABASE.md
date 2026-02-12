# Run this in Supabase so colours save

1. Open **Supabase Dashboard** → your project.
2. Go to **SQL Editor** (left sidebar).
3. Click **New query**.
4. **Paste the SQL below** into the editor.
5. Click **Run** (or Cmd/Ctrl+Enter).
6. You should see "Success. No rows returned."
7. In your app: edit a product in Admin, add colours, click **Save** — they will persist.

---

## SQL to paste (copy everything below this line)

```sql
-- Adds price_by_height and colors columns to products (safe to run more than once)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'price_by_height'
  ) THEN
    ALTER TABLE public.products ADD COLUMN price_by_height JSONB DEFAULT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'colors'
  ) THEN
    ALTER TABLE public.products ADD COLUMN colors TEXT[] DEFAULT '{}';
  END IF;
END $$;
```

---

After this runs, the warning "Colours were not saved because the database is missing the 'colors' column" will stop. Re-save any product in Admin after adding colours and they will be stored.

**If you already ran the migration but colours still don’t save or show:** In SQL Editor run `select pg_notify('pgrst','reload schema');` so Supabase picks up the new column. Then edit each product in Admin, add colours, and Save again.
