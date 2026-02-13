# Shortexet – Where You Are & What's Next

**Last updated:** 2026-02-13

## Latest: Email notifications for orders & contact

- **You get an email** when a new order is placed or a contact form is submitted.
- **One address for both:** Set `ADMIN_EMAIL=your@email.com` in `.env` to receive order and contact notifications at that address.
- **Or separate addresses:** Use `ORDER_NOTIFICATION_EMAIL` for orders and `CONTACT_NOTIFICATION_EMAIL` for contact (contact falls back to `ORDER_NOTIFICATION_EMAIL` if unset).
- **Required env:** `EMAIL_SERVICE=resend`, `RESEND_API_KEY=re_xxx`, and `EMAIL_FROM` (must be a verified domain in Resend). Get API key at [resend.com](https://resend.com).
- **Implementation:** `lib/email-notify.ts` (helper); orders and contact APIs use it so you can view new items in Admin → Orders & Inquiries and get an email at the same time.

## Previous: Admin filters, price per size, and colors

- **Admin product list filters**
  - **LED:** All / With LED / Without LED (dropdown next to search).
  - **Category:** All / Residential / Smart / Commercial.
  - List is filtered by search + LED + category; empty state message reflects filters.

- **Price per size (height)**
  - DB: `price_by_height` JSONB (keys = height value as string e.g. `"30"`, `"40"`; value = price per meter).
  - Admin form: “Default price (NZD/m)” plus “Price per size (NZD/m)” – one input per height (3cm–26cm). Validation: either default price > 0 or at least one size-specific price.
  - Storefront: `getPriceForHeight(product, heightValue)` in `lib/supabase-products.ts` – product detail and cart/checkout use it for line price and totals.

- **Colors per product**
  - DB: `colors` TEXT[] (default `'{}'`).
  - Admin form: “Colors” – add/remove tags (e.g. Black, White, Grey). Saved on create/update.
  - Storefront: product detail shows “Colours” in parameters/specs when `product.colors` is non-empty.

- **API**
  - `GET/POST /api/admin/products`: list and create support `priceByHeight`, `colors`.
  - `PATCH /api/admin/products/[id]`: accepts `priceByHeight` and `colors` in body.

## Where you left off

- Migration `007_add_price_by_height_and_colors.sql` adds `price_by_height` and `colors`.
- Admin products page: filters (LED, category), price-by-height inputs, color tags; create/update send `priceByHeight` and `colors`.
- Storefront product page and checkout modal use `getPriceForHeight()` and display `product.colors` where relevant.

## Next actions

1. **Enable email notifications:** In `.env` add `ADMIN_EMAIL=your@email.com`, `EMAIL_SERVICE=resend`, `RESEND_API_KEY=re_xxx`, and `EMAIL_FROM=you@yourdomain.com` (Resend verified). Restart dev server; new orders and contact submissions will email you.
2. **Run migration:** Apply `supabase/migrations/007_add_price_by_height_and_colors.sql` if not already applied.
3. **Admin:** Use filters to narrow products; when adding/editing a product, set default price and/or price per size, and add colours as needed.

## Key files

- `lib/email-notify.ts` – admin email helper (order + contact notifications)
- `app/api/orders/route.ts` – creates order, sends email to ADMIN_EMAIL / ORDER_NOTIFICATION_EMAIL
- `app/api/contact/route.ts` – creates inquiry, sends email to ADMIN_EMAIL / CONTACT_NOTIFICATION_EMAIL
- `supabase/migrations/007_add_price_by_height_and_colors.sql` – price_by_height, colors columns
- `lib/supabase-products.ts` – types, `getPriceForHeight`, mapDbProduct
- `app/api/admin/products/route.ts` – GET/POST with priceByHeight & colors
- `app/api/admin/products/[id]/route.ts` – PATCH with priceByHeight & colors
- `app/admin/products/page.tsx` – filters, price-per-size form, colors form
- `app/products/[slug]/ProductViewClient.tsx` – price by height, colours in specs
- `components/checkout-modal.tsx` – line price via getPriceForHeight
