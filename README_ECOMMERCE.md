# 🛒 Complete E-Commerce System - B2B & B2C

## 📦 What's Included

This is a **complete e-commerce database schema** with full B2B and B2C support, built on Supabase.

### Features

✅ **User Authentication** - Supabase Auth integration  
✅ **B2B & B2C Support** - Different account types  
✅ **Custom Pricing** - Per-user product pricing for B2B  
✅ **User Discounts** - Percentage-based discounts  
✅ **Shopping Cart** - Persistent database cart  
✅ **Order Management** - Full order lifecycle  
✅ **Order History** - Users can view past orders  
✅ **Admin Dashboard** - Stats and management  

---

## 🚀 Quick Start (3 Steps)

### 1. Run the Schema

1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy **ALL** of `ECOMMERCE_COMPLETE_SCHEMA.sql`
3. Paste and click **Run**

### 2. Create Admin User

1. **Supabase Dashboard** → **Authentication** → **Users** → **Add User**
2. Enter email & password, check **Auto Confirm**
3. Run this SQL:

```sql
UPDATE public.user_profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

### 3. Add Environment Variables

Add to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

**Done!** ✅

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `ECOMMERCE_COMPLETE_SCHEMA.sql` | **Main schema** - Run this first! |
| `QUICK_START.md` | 3-step quick setup guide |
| `ECOMMERCE_SETUP_GUIDE.md` | Complete setup & API examples |
| `api-examples.ts` | TypeScript API route examples |
| `README_ECOMMERCE.md` | This file - overview |

---

## 🏗️ System Architecture

### Database Tables

1. **`products`** - Product catalog with base prices
2. **`user_profiles`** - User info, B2B/B2C, discounts, addresses
3. **`user_product_prices`** - Custom pricing per user (B2B)
4. **`cart_items`** - Shopping cart
5. **`orders`** - Orders with full details
6. **`order_items`** - Order line items
7. **`admin_activity_log`** - Audit trail

### Pricing Logic

```
1. Check for custom price (user_product_prices)
   ↓ (if found, use it)
2. Otherwise use base price (products.price)
   ↓
3. Apply user discount (user_profiles.default_discount_percent)
   ↓
4. Result = Effective Price
```

### B2B vs B2C

| Feature | B2C | B2B |
|---------|-----|-----|
| Account Type | `b2c` | `b2b` |
| Pricing | Public price + optional discount | Custom prices per product |
| Payment | Immediate | Payment terms (Net 30, etc.) |
| Credit Limit | N/A | Can be set |

---

## 🔑 Key Functions

### Get Effective Price
```sql
SELECT get_effective_price('user-uuid', 'product-uuid', 5) as price;
```

### Make User B2B
```sql
UPDATE public.user_profiles 
SET account_type = 'b2b',
    company_name = 'Company Name',
    default_discount_percent = 10
WHERE email = 'user@company.com';
```

### Set Custom Price
```sql
INSERT INTO public.user_product_prices (user_id, product_id, custom_price, min_quantity)
VALUES ('user-uuid', 'product-uuid', 75.00, 10);
```

---

## 📱 API Endpoints to Build

See `ECOMMERCE_SETUP_GUIDE.md` and `api-examples.ts` for complete examples.

### Authentication
- `POST /api/auth/signup`
- `POST /api/auth/signin`
- `POST /api/auth/signout`
- `GET /api/auth/user`

### Products
- `GET /api/products` - List products (public)
- `GET /api/products/:id/price` - Get user's effective price

### Cart
- `GET /api/cart` - Get cart
- `POST /api/cart` - Add to cart
- `PATCH /api/cart/:id` - Update item
- `DELETE /api/cart/:id` - Remove item

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order details

### Admin
- `POST /api/admin/pricing` - Set custom price
- `GET /api/admin/stats` - Dashboard stats
- `PATCH /api/admin/orders/:id` - Update order

---

## 🎯 Usage Examples

### B2C Customer
1. Signs up → `account_type = 'b2c'`
2. Browses products → Sees public prices
3. Adds to cart → Uses public price
4. Checks out → Creates order
5. Views orders → Can see history

### B2B Customer
1. Admin sets `account_type = 'b2b'`
2. Admin sets custom prices per product
3. Customer sees custom prices when logged in
4. Can order with payment terms
5. Gets their discount applied

---

## 🔐 Security

- **RLS Enabled** on all tables
- **Public Access** - Only active products visible
- **User Access** - Users see only their own data
- **Admin Access** - Admins see everything
- **JWT Required** - All authenticated endpoints need token

---

## 📊 Admin Dashboard

### Get Stats
```sql
SELECT * FROM admin_dashboard_stats;
```

### View Orders
```sql
SELECT * FROM orders 
WHERE status = 'pending'
ORDER BY created_at DESC;
```

### View B2B Customers
```sql
SELECT * FROM user_profiles 
WHERE account_type = 'b2b' AND is_active = true;
```

---

## 🆘 Troubleshooting

### "Permission denied"
- Check RLS policies enabled
- Verify user authenticated
- Check user profile exists

### Prices wrong
- Verify `get_effective_price()` function
- Check custom pricing table
- Verify user discount set

### Orders not creating
- Check cart has items
- Verify user authenticated
- Check order_number trigger

---

## 📝 Next Steps

1. ✅ Run schema
2. ✅ Create admin user
3. ✅ Set environment variables
4. 🔨 Build API endpoints
5. 🔨 Build frontend
6. 🔨 Add payment gateway
7. 🔨 Add email notifications

---

## 📖 Full Documentation

- **Quick Start**: `QUICK_START.md`
- **Complete Guide**: `ECOMMERCE_SETUP_GUIDE.md`
- **API Examples**: `api-examples.ts`

---

## ✅ You're Ready!

The database is fully set up. Start building your API and frontend!

**Questions?** Check the documentation files above.
