-- ============================================================================
-- COMPLETE SUPABASE SCHEMA FOR PRODUCTS & ADMIN MANAGEMENT
-- ============================================================================
-- Run this entire script in Supabase SQL Editor
-- This creates all tables, functions, and policies needed for admin functionality
-- ============================================================================

-- ============================================================================
-- 1. PRODUCTS TABLE (Enhanced with active status)
-- ============================================================================

-- Drop existing table if needed (uncomment if you want to recreate)
-- DROP TABLE IF EXISTS public.products CASCADE;

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
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('residential', 'smart', 'commercial')),
  seo_title TEXT,
  seo_description TEXT,
  meta_keywords TEXT[] DEFAULT '{}',
  in_stock BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true, -- New: for admin to activate/deactivate products
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Indexes for products
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON public.products(in_stock);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- ============================================================================
-- 2. USER PROFILES TABLE (Extends Supabase auth.users)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON public.user_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);

-- ============================================================================
-- 3. ADMIN ACTIVITY LOG (Track admin actions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.admin_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'create_product', 'update_product', 'delete_product', 'activate_user', etc.
  resource_type TEXT NOT NULL, -- 'product', 'user', etc.
  resource_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for activity log
CREATE INDEX IF NOT EXISTS idx_admin_activity_user_id ON public.admin_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_action ON public.admin_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_admin_activity_resource_type ON public.admin_activity_log(resource_type);
CREATE INDEX IF NOT EXISTS idx_admin_activity_created_at ON public.admin_activity_log(created_at DESC);

-- ============================================================================
-- 4. HELPER FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
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

-- Function to check if user is admin or moderator
CREATE OR REPLACE FUNCTION is_admin_or_moderator(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = user_uuid
    AND role IN ('admin', 'moderator')
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user ID from JWT
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS UUID AS $$
  SELECT (current_setting('request.jwt.claims', true)::json->>'sub')::UUID;
$$ LANGUAGE sql STABLE;

-- Function to log admin activity
CREATE OR REPLACE FUNCTION log_admin_activity(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  INSERT INTO public.admin_activity_log (
    user_id,
    action,
    resource_type,
    resource_id,
    details
  ) VALUES (
    v_user_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_details
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user last login
CREATE OR REPLACE FUNCTION update_user_last_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.user_profiles
  SET last_login = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 5. TRIGGERS
-- ============================================================================

-- Trigger to update updated_at on products
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at on user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Trigger to log product changes
CREATE OR REPLACE FUNCTION log_product_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_action TEXT;
  v_details JSONB;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_action := 'create_product';
    v_details := jsonb_build_object(
      'name', NEW.name,
      'slug', NEW.slug,
      'price', NEW.price
    );
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'update_product';
    v_details := jsonb_build_object(
      'name', NEW.name,
      'slug', NEW.slug,
      'price', NEW.price,
      'changes', jsonb_build_object(
        'name', CASE WHEN OLD.name != NEW.name THEN jsonb_build_object('old', OLD.name, 'new', NEW.name) ELSE NULL END,
        'price', CASE WHEN OLD.price != NEW.price THEN jsonb_build_object('old', OLD.price, 'new', NEW.price) ELSE NULL END,
        'is_active', CASE WHEN OLD.is_active != NEW.is_active THEN jsonb_build_object('old', OLD.is_active, 'new', NEW.is_active) ELSE NULL END
      )
    );
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'delete_product';
    v_details := jsonb_build_object(
      'name', OLD.name,
      'slug', OLD.slug
    );
  END IF;
  
  PERFORM log_admin_activity(v_action, 'product', COALESCE(NEW.id, OLD.id), v_details);
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS log_product_changes_trigger ON public.products;
CREATE TRIGGER log_product_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION log_product_changes();

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PRODUCTS POLICIES
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access" ON public.products;
DROP POLICY IF EXISTS "Allow admin full access" ON public.products;
DROP POLICY IF EXISTS "Allow admin insert" ON public.products;
DROP POLICY IF EXISTS "Allow admin update" ON public.products;
DROP POLICY IF EXISTS "Allow admin delete" ON public.products;

-- Public can read active products
CREATE POLICY "Allow public read active products"
  ON public.products
  FOR SELECT
  USING (is_active = true);

-- Admins can read all products
CREATE POLICY "Allow admin read all products"
  ON public.products
  FOR SELECT
  USING (is_admin(auth.uid()));

-- Admins can insert products
CREATE POLICY "Allow admin insert products"
  ON public.products
  FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- Admins can update products
CREATE POLICY "Allow admin update products"
  ON public.products
  FOR UPDATE
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Admins can delete products
CREATE POLICY "Allow admin delete products"
  ON public.products
  FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================================================
-- USER PROFILES POLICIES
-- ============================================================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
  ON public.user_profiles
  FOR SELECT
  USING (is_admin(auth.uid()));

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND (role = OLD.role) -- Cannot change own role
    AND (is_active = OLD.is_active OR is_admin(auth.uid())) -- Cannot change own active status unless admin
  );

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON public.user_profiles
  FOR UPDATE
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- ============================================================================
-- ADMIN ACTIVITY LOG POLICIES
-- ============================================================================

-- Only admins can read activity log
CREATE POLICY "Admins can read activity log"
  ON public.admin_activity_log
  FOR SELECT
  USING (is_admin(auth.uid()));

-- System can insert activity log (via functions)
CREATE POLICY "System can insert activity log"
  ON public.admin_activity_log
  FOR INSERT
  WITH CHECK (true); -- Functions run with SECURITY DEFINER

-- ============================================================================
-- 7. VIEWS FOR ADMIN DASHBOARD
-- ============================================================================

-- View: Active products count
CREATE OR REPLACE VIEW admin_active_products_count AS
SELECT 
  COUNT(*) FILTER (WHERE is_active = true) as active_count,
  COUNT(*) FILTER (WHERE is_active = false) as inactive_count,
  COUNT(*) as total_count
FROM public.products;

-- View: Active users count
CREATE OR REPLACE VIEW admin_active_users_count AS
SELECT 
  COUNT(*) FILTER (WHERE is_active = true) as active_count,
  COUNT(*) FILTER (WHERE is_active = false) as inactive_count,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE role = 'admin') as admin_count,
  COUNT(*) FILTER (WHERE role = 'moderator') as moderator_count,
  COUNT(*) FILTER (WHERE role = 'user') as user_count
FROM public.user_profiles;

-- View: Recent admin activity
CREATE OR REPLACE VIEW admin_recent_activity AS
SELECT 
  al.id,
  al.action,
  al.resource_type,
  al.resource_id,
  al.details,
  al.created_at,
  up.email as user_email,
  up.full_name as user_name,
  up.role as user_role
FROM public.admin_activity_log al
LEFT JOIN public.user_profiles up ON al.user_id = up.id
ORDER BY al.created_at DESC
LIMIT 100;

-- View: Products with creator info
CREATE OR REPLACE VIEW admin_products_with_creator AS
SELECT 
  p.*,
  creator.email as created_by_email,
  creator.full_name as created_by_name,
  updater.email as updated_by_email,
  updater.full_name as updated_by_name
FROM public.products p
LEFT JOIN public.user_profiles creator ON p.created_by = creator.id
LEFT JOIN public.user_profiles updater ON p.updated_by = updater.id;

-- ============================================================================
-- 8. GRANT PERMISSIONS
-- ============================================================================

-- Grant access to authenticated users for reading their own data
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.products TO authenticated;
GRANT SELECT ON public.user_profiles TO authenticated;

-- Grant admin functions (will be checked via RLS)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT SELECT, UPDATE ON public.user_profiles TO authenticated;
GRANT SELECT ON public.admin_activity_log TO authenticated;
GRANT SELECT ON admin_active_products_count TO authenticated;
GRANT SELECT ON admin_active_users_count TO authenticated;
GRANT SELECT ON admin_recent_activity TO authenticated;
GRANT SELECT ON admin_products_with_creator TO authenticated;

-- ============================================================================
-- 9. SEED DATA (Optional - Create first admin user)
-- ============================================================================

-- Note: After running this schema, you need to:
-- 1. Create a user via Supabase Auth (Dashboard → Authentication → Users → Add User)
-- 2. Get the user's UUID
-- 3. Run this to make them admin:
--    UPDATE public.user_profiles SET role = 'admin' WHERE id = 'USER_UUID_HERE';

-- ============================================================================
-- 10. RELOAD POSTGREST SCHEMA
-- ============================================================================

NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- COMPLETE!
-- ============================================================================
-- Next steps:
-- 1. Create your first admin user in Supabase Dashboard → Authentication
-- 2. Update their role: UPDATE public.user_profiles SET role = 'admin' WHERE email = 'your-email@example.com';
-- 3. Test the API endpoints
-- ============================================================================
