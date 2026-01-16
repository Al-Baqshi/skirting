# 🚀 Quick Start - E-Commerce Setup

## What You Get

✅ **Full E-Commerce System** with B2B & B2C support  
✅ **User Authentication** via Supabase  
✅ **Shopping Cart** that persists  
✅ **Order Management** with history  
✅ **Custom Pricing** per user (B2B)  
✅ **User Discounts** (percentage-based)  

---

## ⚡ 3-Step Setup

### 1️⃣ Run the Schema

1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy **ALL** of `ECOMMERCE_COMPLETE_SCHEMA.sql`
3. Paste and click **Run**
4. ✅ Done!

### 2️⃣ Create Admin User

1. **Supabase Dashboard** → **Authentication** → **Users** → **Add User**
2. Enter email & password
3. Check **Auto Confirm**
4. Click **Create**
5. Run this SQL:

```sql
UPDATE public.user_profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

### 3️⃣ Add Environment Variables

Add to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Find these in**: Supabase Dashboard → Settings → API

---

## 🎯 How It Works

### B2C (Regular Customers)
- See **public prices** from products table
- Optional **discount** applied (if set)
- Standard checkout

### B2B (Business Customers)
- See **custom prices** (if set per product)
- Or **public price + discount**
- Can have **payment terms** (Net 30, Net 60)
- **Credit limits** for large orders

### Pricing Priority
1. **Custom price** (from `user_product_prices`) ← Highest priority
2. **Base price** (from `products`)
3. **User discount** applied (from `user_profiles.default_discount_percent`)

---

## 📋 Key Tables

| Table | Purpose |
|-------|---------|
| `products` | Product catalog |
| `user_profiles` | User info, B2B/B2C, discounts |
| `user_product_prices` | Custom pricing per user |
| `cart_items` | Shopping cart |
| `orders` | Orders |
| `order_items` | Order line items |

---

## 🔑 Common Tasks

### Make a User B2B
```sql
UPDATE public.user_profiles 
SET account_type = 'b2b',
    company_name = 'Company Name',
    default_discount_percent = 10
WHERE email = 'user@company.com';
```

### Set Custom Price for B2B User
```sql
INSERT INTO public.user_product_prices (user_id, product_id, custom_price, min_quantity)
VALUES (
  'user-uuid',
  'product-uuid',
  75.00,  -- Custom price
  10      -- Min quantity
);
```

### Get User's Effective Price
```sql
SELECT get_effective_price('user-uuid', 'product-uuid', 5) as price;
```

### View User's Orders
```sql
SELECT * FROM user_order_history 
WHERE user_id = 'user-uuid'
ORDER BY created_at DESC;
```

---

## 📱 Next: Build Your API

See `ECOMMERCE_SETUP_GUIDE.md` for complete API examples.

Key endpoints to build:
- `/api/auth/*` - Authentication
- `/api/products` - Product listing
- `/api/cart/*` - Cart management
- `/api/orders/*` - Order creation & history
- `/api/admin/*` - Admin functions

---

## ✅ You're Ready!

The database is set up. Now build your frontend and API endpoints.

**Need help?** Check `ECOMMERCE_SETUP_GUIDE.md` for detailed examples.
