# Complete E-Commerce Setup Guide - B2B & B2C

## 🎯 What This System Includes

✅ **User Authentication** - Supabase Auth integration  
✅ **B2B & B2C Support** - Different account types with custom pricing  
✅ **Shopping Cart** - Persistent cart per user  
✅ **Order Management** - Full order lifecycle  
✅ **Order History** - Users can view past orders  
✅ **Custom Pricing** - Per-user product pricing for B2B  
✅ **User Discounts** - Default discount percentage per user  
✅ **Admin Dashboard** - Stats and management views  

---

## 📋 Step-by-Step Setup

### Step 1: Run the Complete Schema

1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy the entire contents of `ECOMMERCE_COMPLETE_SCHEMA.sql`
3. Paste and click **Run**
4. Wait for success message

### Step 2: Create Your First Admin User

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click **"Add User"** or **"Invite User"**
3. Enter:
   - Email: `admin@yourcompany.com`
   - Password: (set a strong password)
   - Auto Confirm: ✅ (check this)
4. Click **Create User**
5. Get the user's UUID or email
6. Run this SQL to make them admin:

```sql
UPDATE public.user_profiles 
SET role = 'admin', account_type = 'b2b'
WHERE email = 'admin@yourcompany.com';
```

### Step 3: Configure Supabase Auth Settings

1. Go to **Authentication** → **Settings**
2. Enable **Email** authentication
3. Set **Site URL**: `http://localhost:3000` (or your production URL)
4. Add **Redirect URLs**: 
   - `http://localhost:3000/**`
   - `https://yourdomain.com/**`
5. Save changes

### Step 4: Set Up Environment Variables

Add to your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## 🏗️ Database Structure

### Tables Created

1. **`products`** - Product catalog
2. **`user_profiles`** - Extended user info (B2B/B2C, discounts, addresses)
3. **`user_product_prices`** - Custom pricing per user (B2B)
4. **`cart_items`** - Shopping cart
5. **`orders`** - Orders
6. **`order_items`** - Order line items
7. **`admin_activity_log`** - Audit trail

### Key Features

#### B2B vs B2C
- **B2C**: Uses public product prices, optional user discount
- **B2B**: Can have custom pricing per product, payment terms, credit limits

#### Pricing Logic
1. Check for custom price in `user_product_prices`
2. If not found, use product's base price
3. Apply user's `default_discount_percent`
4. Result is the effective price

---

## 🔌 API Endpoints to Build

### Authentication

```typescript
// Sign up
POST /api/auth/signup
Body: { email, password, full_name }

// Sign in
POST /api/auth/signin
Body: { email, password }

// Sign out
POST /api/auth/signout

// Get current user
GET /api/auth/user
```

### Products

```typescript
// Get products (public - only active)
GET /api/products
Query: ?category=residential&search=led

// Get product with user's effective price
GET /api/products/:id/price
Headers: Authorization: Bearer <token>
Returns: { price, is_custom, discount_applied }

// Admin: Get all products
GET /api/admin/products
Headers: Authorization: Bearer <admin_token>
```

### Cart

```typescript
// Get cart
GET /api/cart
Headers: Authorization: Bearer <token>

// Add to cart
POST /api/cart
Body: { product_id, quantity, length }
Headers: Authorization: Bearer <token>

// Update cart item
PATCH /api/cart/:id
Body: { quantity, length }
Headers: Authorization: Bearer <token>

// Remove from cart
DELETE /api/cart/:id
Headers: Authorization: Bearer <token>

// Clear cart
DELETE /api/cart
Headers: Authorization: Bearer <token>
```

### Orders

```typescript
// Create order from cart
POST /api/orders
Body: {
  shipping_address: {...},
  billing_address: {...},
  payment_method: 'credit_card',
  customer_notes: '...'
}
Headers: Authorization: Bearer <token>

// Get user's orders
GET /api/orders
Headers: Authorization: Bearer <token>
Query: ?status=pending

// Get order details
GET /api/orders/:id
Headers: Authorization: Bearer <token>

// Admin: Update order status
PATCH /api/admin/orders/:id
Body: { status: 'confirmed', admin_notes: '...' }
Headers: Authorization: Bearer <admin_token>
```

### B2B Pricing (Admin Only)

```typescript
// Set custom price for user
POST /api/admin/pricing
Body: {
  user_id: 'uuid',
  product_id: 'uuid',
  custom_price: 89.99,
  min_quantity: 10
}

// Get user's custom prices
GET /api/admin/pricing?user_id=uuid

// Set user discount
PATCH /api/admin/users/:id
Body: { default_discount_percent: 15 }
```

---

## 💡 Usage Examples

### Example 1: B2C Customer Flow

1. **Sign up** → Creates user profile with `account_type = 'b2c'`
2. **Browse products** → Sees public prices
3. **Add to cart** → Uses public price
4. **Checkout** → Creates order
5. **View orders** → Can see order history

### Example 2: B2B Customer Flow

1. **Admin creates B2B account**:
   ```sql
   UPDATE public.user_profiles 
   SET account_type = 'b2b',
       company_name = 'ABC Company',
       default_discount_percent = 10,
       payment_terms = 'Net 30'
   WHERE email = 'b2b@company.com';
   ```

2. **Admin sets custom pricing**:
   ```sql
   INSERT INTO public.user_product_prices (user_id, product_id, custom_price, min_quantity)
   VALUES (
     'user-uuid',
     'product-uuid',
     75.00,  -- Custom price
     10      -- Minimum quantity
   );
   ```

3. **B2B customer**:
   - Sees custom prices when logged in
   - Can order with payment terms
   - Gets their discount applied

### Example 3: Calculate Effective Price

```sql
-- Get effective price for a user
SELECT get_effective_price(
  'user-uuid',
  'product-uuid',
  5  -- quantity
) as effective_price;
```

---

## 📊 Admin Dashboard Queries

### Get Dashboard Stats

```sql
SELECT * FROM admin_dashboard_stats;
```

### Get All B2B Customers

```sql
SELECT id, email, company_name, default_discount_percent, payment_terms
FROM public.user_profiles
WHERE account_type = 'b2b' AND is_active = true;
```

### Get User's Custom Prices

```sql
SELECT 
  p.name,
  p.price as public_price,
  upp.custom_price,
  upp.min_quantity
FROM public.user_product_prices upp
JOIN public.products p ON upp.product_id = p.id
WHERE upp.user_id = 'user-uuid';
```

### Get Order Statistics

```sql
SELECT 
  status,
  COUNT(*) as count,
  SUM(total_amount) as total
FROM public.orders
GROUP BY status;
```

---

## 🔐 Security Notes

1. **RLS Policies**: All tables have Row Level Security enabled
2. **Public Access**: Only active products are visible to public
3. **User Access**: Users can only see/modify their own data
4. **Admin Access**: Admins can see/modify everything
5. **JWT Required**: All authenticated endpoints require valid JWT token

---

## 🚀 Next Steps

1. ✅ Run the schema
2. ✅ Create admin user
3. ✅ Set up environment variables
4. 🔨 Build API endpoints (see examples above)
5. 🔨 Build frontend components:
   - Login/Signup
   - Product listing with pricing
   - Shopping cart
   - Checkout
   - Order history
   - Admin dashboard
6. 🔨 Integrate payment gateway (Stripe, etc.)
7. 🔨 Add email notifications for orders

---

## 📝 Important Notes

- **Order Numbers**: Auto-generated as `ORD-YYYY-000001`
- **Pricing**: Custom prices override base prices, then discount is applied
- **Cart**: Persists across sessions (stored in database)
- **Orders**: Immutable once created (status can be updated)
- **B2B**: Requires admin to set `account_type = 'b2b'` and custom pricing

---

## 🆘 Troubleshooting

### "Permission denied" errors
- Check RLS policies are enabled
- Verify user is authenticated
- Check user profile exists and is active

### Prices not showing correctly
- Verify `get_effective_price()` function exists
- Check custom pricing table has correct user_id
- Verify user's `default_discount_percent` is set

### Orders not creating
- Check cart has items
- Verify user is authenticated
- Check order_number trigger is working

---

## 📚 Additional Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js + Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
