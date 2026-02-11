-- ============================================================================
-- CONTACT INQUIRIES & GUEST ORDERS TABLES
-- ============================================================================
-- For storing contact form submissions and guest orders
-- No authentication required - perfect for manual operation
-- ============================================================================

-- ============================================================================
-- 1. CONTACT INQUIRIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.contact_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Customer Information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  
  -- Inquiry Details
  service TEXT DEFAULT 'other' CHECK (service IN ('quote', 'installation', 'consultation', 'other')),
  message TEXT,
  
  -- Status
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'resolved', 'archived')),
  
  -- Admin Notes
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  contacted_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_contact_inquiries_status ON public.contact_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_created_at ON public.contact_inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_email ON public.contact_inquiries(email);

-- ============================================================================
-- 2. GUEST ORDERS TABLE (No authentication required)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.guest_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE, -- e.g., ORD-2024-001
  
  -- Customer Information
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT,
  customer_city TEXT,
  customer_postal_code TEXT,
  customer_notes TEXT,
  
  -- Order Status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',      -- Order placed, awaiting contact
    'contacted',    -- Customer contacted
    'confirmed',    -- Order confirmed
    'processing',   -- Order being prepared
    'shipped',      -- Order shipped
    'delivered',    -- Order delivered
    'cancelled'     -- Order cancelled
  )),
  
  -- Order Total
  total_amount DECIMAL(10, 2) NOT NULL,
  
  -- Order Items (stored as JSONB for simplicity)
  items JSONB NOT NULL, -- Array of order items
  
  -- Admin Notes
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  contacted_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_guest_orders_status ON public.guest_orders(status);
CREATE INDEX IF NOT EXISTS idx_guest_orders_created_at ON public.guest_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_guest_orders_email ON public.guest_orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_guest_orders_order_number ON public.guest_orders(order_number);

-- ============================================================================
-- 3. UPDATE TRIGGER FOR updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_contact_inquiries_updated_at ON public.contact_inquiries;
CREATE TRIGGER update_contact_inquiries_updated_at
  BEFORE UPDATE ON public.contact_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_guest_orders_updated_at ON public.guest_orders;
CREATE TRIGGER update_guest_orders_updated_at
  BEFORE UPDATE ON public.guest_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. GRANT PERMISSIONS (Public read/write for these tables)
-- ============================================================================

-- Allow public to insert (for form submissions)
GRANT INSERT ON public.contact_inquiries TO anon, authenticated;
GRANT INSERT ON public.guest_orders TO anon, authenticated;

-- Allow authenticated users (admins) to read/update
GRANT SELECT, UPDATE ON public.contact_inquiries TO authenticated;
GRANT SELECT, UPDATE ON public.guest_orders TO authenticated;

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_orders ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (for form submissions)
DROP POLICY IF EXISTS "Allow public insert contact inquiries" ON public.contact_inquiries;
CREATE POLICY "Allow public insert contact inquiries"
  ON public.contact_inquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public insert guest orders" ON public.guest_orders;
CREATE POLICY "Allow public insert guest orders"
  ON public.guest_orders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admins can read/update all
DROP POLICY IF EXISTS "Allow admin read all contact inquiries" ON public.contact_inquiries;
CREATE POLICY "Allow admin read all contact inquiries"
  ON public.contact_inquiries
  FOR SELECT
  TO authenticated
  USING (true); -- You can add admin check here if needed

DROP POLICY IF EXISTS "Allow admin update contact inquiries" ON public.contact_inquiries;
CREATE POLICY "Allow admin update contact inquiries"
  ON public.contact_inquiries
  FOR UPDATE
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow admin read all guest orders" ON public.guest_orders;
CREATE POLICY "Allow admin read all guest orders"
  ON public.guest_orders
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow admin update guest orders" ON public.guest_orders;
CREATE POLICY "Allow admin update guest orders"
  ON public.guest_orders
  FOR UPDATE
  TO authenticated
  USING (true);

-- ============================================================================
-- DONE!
-- ============================================================================
-- Now you can:
-- 1. View inquiries in Supabase Dashboard → Table Editor → contact_inquiries
-- 2. View orders in Supabase Dashboard → Table Editor → guest_orders
-- 3. No email service needed - everything is stored in database
-- ============================================================================
