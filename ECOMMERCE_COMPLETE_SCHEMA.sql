-- ============================================================================
-- COMPLETE E-COMMERCE SCHEMA WITH B2B & B2C SUPPORT
-- ============================================================================
-- This schema includes:
-- - User authentication & profiles
-- - Products with pricing
-- - B2B custom pricing per user
-- - User-specific discounts
-- - Shopping cart
-- - Orders & order items
-- - Order history
-- ============================================================================

-- ============================================================================
-- 1. PRODUCTS TABLE (Enhanced)
-- ============================================================================

-- Create or upgrade products table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'products'
  ) THEN
    CREATE TABLE public.products (
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
      price DECIMAL(10, 2) NOT NULL, -- Public/B2C price
      description TEXT,
      category TEXT CHECK (category IN ('residential', 'smart', 'commercial')),
      seo_title TEXT,
      seo_description TEXT,
      meta_keywords TEXT[] DEFAULT '{}',
      in_stock BOOLEAN DEFAULT true,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      created_by UUID REFERENCES auth.users(id),
      updated_by UUID REFERENCES auth.users(id)
    );
  ELSE
    -- Add missing columns if table exists
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'products' 
      AND column_name = 'is_active'
    ) THEN
      ALTER TABLE public.products ADD COLUMN is_active BOOLEAN DEFAULT true;
      UPDATE public.products SET is_active = true WHERE is_active IS NULL;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'products' 
      AND column_name = 'created_by'
    ) THEN
      ALTER TABLE public.products ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'products' 
      AND column_name = 'updated_by'
    ) THEN
      ALTER TABLE public.products ADD COLUMN updated_by UUID REFERENCES auth.users(id);
    END IF;

    BEGIN
      ALTER TABLE public.products ALTER COLUMN price SET NOT NULL;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON public.products(in_stock);

-- ============================================================================
-- 2. USER PROFILES (Enhanced for B2B/B2C)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  company_name TEXT, -- For B2B customers
  phone TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'New Zealand',
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator', 'b2b')),
  account_type TEXT DEFAULT 'b2c' CHECK (account_type IN ('b2c', 'b2b')), -- B2B or B2C
  is_active BOOLEAN DEFAULT true,
  default_discount_percent DECIMAL(5, 2) DEFAULT 0, -- Default discount for this user (0-100)
  tax_id TEXT, -- For B2B customers
  payment_terms TEXT, -- e.g., "Net 30", "Net 60"
  credit_limit DECIMAL(10, 2), -- For B2B customers
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_account_type ON public.user_profiles(account_type);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON public.user_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);

-- ============================================================================
-- 3. USER-SPECIFIC PRODUCT PRICING (B2B Custom Pricing)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_product_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  custom_price DECIMAL(10, 2) NOT NULL, -- Custom price for this user
  min_quantity INTEGER DEFAULT 1, -- Minimum quantity for this price
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ, -- NULL means no expiration
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id) -- One custom price per user per product
);

CREATE INDEX IF NOT EXISTS idx_user_product_prices_user_id ON public.user_product_prices(user_id);
CREATE INDEX IF NOT EXISTS idx_user_product_prices_product_id ON public.user_product_prices(product_id);
CREATE INDEX IF NOT EXISTS idx_user_product_prices_valid ON public.user_product_prices(valid_from, valid_until);

-- ============================================================================
-- 4. SHOPPING CART
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  length DECIMAL(10, 2) NOT NULL DEFAULT 1.0, -- Length in meters
  unit_price DECIMAL(10, 2) NOT NULL, -- Price at time of adding to cart
  subtotal DECIMAL(10, 2) NOT NULL, -- quantity * length * unit_price
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id) -- One cart item per user per product
);

CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items(product_id);

-- ============================================================================
-- 5. ORDERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE, -- Human-readable order number (e.g., ORD-2024-001)
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  
  -- Order Status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',      -- Order placed, awaiting payment/confirmation
    'confirmed',    -- Order confirmed, processing
    'processing',  -- Order being prepared
    'shipped',      -- Order shipped
    'delivered',    -- Order delivered
    'cancelled',    -- Order cancelled
    'refunded'      -- Order refunded
  )),
  
  -- Pricing
  subtotal DECIMAL(10, 2) NOT NULL, -- Before discount and tax
  discount_amount DECIMAL(10, 2) DEFAULT 0, -- Total discount applied
  discount_percent DECIMAL(5, 2) DEFAULT 0, -- Discount percentage used
  tax_amount DECIMAL(10, 2) DEFAULT 0, -- Tax amount
  tax_rate DECIMAL(5, 2) DEFAULT 0.15, -- GST rate (15% in NZ)
  shipping_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL, -- Final total
  
  -- Shipping Address
  shipping_name TEXT,
  shipping_company TEXT,
  shipping_address_line1 TEXT,
  shipping_address_line2 TEXT,
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_postal_code TEXT,
  shipping_country TEXT,
  shipping_phone TEXT,
  
  -- Billing Address (if different)
  billing_name TEXT,
  billing_company TEXT,
  billing_address_line1 TEXT,
  billing_address_line2 TEXT,
  billing_city TEXT,
  billing_state TEXT,
  billing_postal_code TEXT,
  billing_country TEXT,
  
  -- Payment
  payment_method TEXT, -- 'credit_card', 'bank_transfer', 'account', etc.
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_reference TEXT, -- Transaction ID or reference
  
  -- Notes
  customer_notes TEXT, -- Notes from customer
  admin_notes TEXT, -- Internal admin notes
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- ============================================================================
-- 6. ORDER ITEMS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  
  -- Product details at time of order (snapshot)
  product_name TEXT NOT NULL,
  product_sku TEXT, -- If you add SKU later
  product_image TEXT,
  
  -- Quantity and pricing
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  length DECIMAL(10, 2) NOT NULL DEFAULT 1.0,
  unit_price DECIMAL(10, 2) NOT NULL, -- Price per unit at time of order
  discount_percent DECIMAL(5, 2) DEFAULT 0, -- Discount applied to this item
  line_total DECIMAL(10, 2) NOT NULL, -- quantity * length * unit_price * (1 - discount_percent/100)
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- ============================================================================
-- 7. ADMIN ACTIVITY LOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.admin_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_activity_user_id ON public.admin_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_action ON public.admin_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_admin_activity_created_at ON public.admin_activity_log(created_at DESC);

-- ============================================================================
-- 8. HELPER FUNCTIONS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = user_uuid
    AND role = 'admin'
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get current user ID from JWT
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS UUID AS $$
  SELECT (current_setting('request.jwt.claims', true)::json->>'sub')::UUID;
$$ LANGUAGE sql STABLE;

-- Get effective price for a user (checks custom pricing, then applies discount)
CREATE OR REPLACE FUNCTION get_effective_price(
  p_user_id UUID,
  p_product_id UUID,
  p_quantity INTEGER DEFAULT 1
)
RETURNS DECIMAL(10, 2) AS $$
DECLARE
  v_base_price DECIMAL(10, 2);
  v_custom_price DECIMAL(10, 2);
  v_discount_percent DECIMAL(5, 2);
  v_final_price DECIMAL(10, 2);
BEGIN
  -- Get base product price
  SELECT price INTO v_base_price
  FROM public.products
  WHERE id = p_product_id AND is_active = true;
  
  IF v_base_price IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Check for custom pricing
  SELECT custom_price INTO v_custom_price
  FROM public.user_product_prices
  WHERE user_id = p_user_id
    AND product_id = p_product_id
    AND min_quantity <= p_quantity
    AND (valid_until IS NULL OR valid_until > NOW())
  ORDER BY min_quantity DESC
  LIMIT 1;
  
  -- Use custom price if available, otherwise base price
  IF v_custom_price IS NOT NULL THEN
    v_final_price := v_custom_price;
  ELSE
    v_final_price := v_base_price;
  END IF;
  
  -- Apply user's default discount
  SELECT COALESCE(default_discount_percent, 0) INTO v_discount_percent
  FROM public.user_profiles
  WHERE id = p_user_id AND is_active = true;
  
  IF v_discount_percent > 0 THEN
    v_final_price := v_final_price * (1 - v_discount_percent / 100);
  END IF;
  
  RETURN ROUND(v_final_price, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  v_year TEXT;
  v_seq INTEGER;
  v_order_num TEXT;
BEGIN
  v_year := TO_CHAR(NOW(), 'YYYY');
  
  -- Get next sequence number for this year
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM '(\d+)$') AS INTEGER)), 0) + 1
  INTO v_seq
  FROM public.orders
  WHERE order_number LIKE 'ORD-' || v_year || '-%';
  
  v_order_num := 'ORD-' || v_year || '-' || LPAD(v_seq::TEXT, 6, '0');
  
  RETURN v_order_num;
END;
$$ LANGUAGE plpgsql;

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role, account_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'user',
    'b2c'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 9. TRIGGERS
-- ============================================================================

-- Update timestamps
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cart_items_updated_at ON public.cart_items;
CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Auto-generate order number
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_order_number_trigger ON public.orders;
CREATE TRIGGER set_order_number_trigger
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();

-- Update order status timestamps
CREATE OR REPLACE FUNCTION update_order_status_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    NEW.confirmed_at := NOW();
  END IF;
  
  IF NEW.status = 'shipped' AND OLD.status != 'shipped' THEN
    NEW.shipped_at := NOW();
  END IF;
  
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    NEW.delivered_at := NOW();
  END IF;
  
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    NEW.cancelled_at := NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_order_status_timestamps_trigger ON public.orders;
CREATE TRIGGER update_order_status_timestamps_trigger
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_order_status_timestamps();

-- ============================================================================
-- 10. ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_product_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Products: Public can read active, admins can do everything
DROP POLICY IF EXISTS "Allow public read active products" ON public.products;
CREATE POLICY "Allow public read active products"
  ON public.products FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Allow admin full access products" ON public.products;
CREATE POLICY "Allow admin full access products"
  ON public.products FOR ALL
  USING (is_admin(auth.uid()));

-- User Profiles: Users see own, admins see all
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
CREATE POLICY "Users can read own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can read all profiles" ON public.user_profiles;
CREATE POLICY "Admins can read all profiles"
  ON public.user_profiles FOR SELECT
  USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update any profile" ON public.user_profiles;
CREATE POLICY "Admins can update any profile"
  ON public.user_profiles FOR UPDATE
  USING (is_admin(auth.uid()));

-- User Product Prices: Users see own, admins see all
DROP POLICY IF EXISTS "Users can read own prices" ON public.user_product_prices;
CREATE POLICY "Users can read own prices"
  ON public.user_product_prices FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all prices" ON public.user_product_prices;
CREATE POLICY "Admins can manage all prices"
  ON public.user_product_prices FOR ALL
  USING (is_admin(auth.uid()));

-- Cart Items: Users manage own cart
DROP POLICY IF EXISTS "Users manage own cart" ON public.cart_items;
CREATE POLICY "Users manage own cart"
  ON public.cart_items FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Orders: Users see own orders, admins see all
DROP POLICY IF EXISTS "Users can read own orders" ON public.orders;
CREATE POLICY "Users can read own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;
CREATE POLICY "Users can create own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
CREATE POLICY "Admins can manage all orders"
  ON public.orders FOR ALL
  USING (is_admin(auth.uid()));

-- Order Items: Inherit from orders
DROP POLICY IF EXISTS "Users can read own order items" ON public.order_items;
CREATE POLICY "Users can read own order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can manage all order items" ON public.order_items;
CREATE POLICY "Admins can manage all order items"
  ON public.order_items FOR ALL
  USING (is_admin(auth.uid()));

-- Activity Log: Admins only
DROP POLICY IF EXISTS "Admins can read activity log" ON public.admin_activity_log;
CREATE POLICY "Admins can read activity log"
  ON public.admin_activity_log FOR SELECT
  USING (is_admin(auth.uid()));

-- ============================================================================
-- 11. VIEWS FOR DASHBOARD
-- ============================================================================

-- User's order history
CREATE OR REPLACE VIEW user_order_history AS
SELECT 
  o.*,
  COUNT(oi.id) as item_count,
  SUM(oi.line_total) as items_total
FROM public.orders o
LEFT JOIN public.order_items oi ON o.id = oi.order_id
GROUP BY o.id;

-- Admin dashboard stats
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM public.products WHERE is_active = true) as active_products,
  (SELECT COUNT(*) FROM public.user_profiles WHERE is_active = true) as active_users,
  (SELECT COUNT(*) FROM public.user_profiles WHERE account_type = 'b2b') as b2b_customers,
  (SELECT COUNT(*) FROM public.orders WHERE status = 'pending') as pending_orders,
  (SELECT COUNT(*) FROM public.orders WHERE status = 'confirmed') as confirmed_orders,
  (SELECT SUM(total_amount) FROM public.orders WHERE status IN ('confirmed', 'processing', 'shipped', 'delivered')) as total_revenue;

-- ============================================================================
-- 12. GRANT PERMISSIONS
-- ============================================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT SELECT, UPDATE ON public.user_profiles TO authenticated;
GRANT SELECT ON public.user_product_prices TO authenticated;
GRANT ALL ON public.cart_items TO authenticated;
GRANT SELECT, INSERT ON public.orders TO authenticated;
GRANT SELECT ON public.order_items TO authenticated;
GRANT SELECT ON user_order_history TO authenticated;
GRANT SELECT ON admin_dashboard_stats TO authenticated;

-- ============================================================================
-- 13. RELOAD POSTGREST
-- ============================================================================

NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- COMPLETE!
-- ============================================================================
