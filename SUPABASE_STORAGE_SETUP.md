# Supabase Database Storage Setup

## ✅ Perfect for Manual Operation!

**You don't need any email service!** Supabase is enough. All inquiries and orders are stored in your database, and you can view them directly in the Supabase dashboard.

## 🚀 Quick Setup (2 Steps)

### Step 1: Run the Database Migration

1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy the entire contents of `supabase/migrations/003_contact_and_orders.sql`
3. Paste and click **Run**
4. Wait for success message

This creates two tables:
- `contact_inquiries` - Stores all contact form submissions
- `guest_orders` - Stores all order submissions

### Step 2: That's It!

No email service needed. Everything is stored in Supabase.

## 📊 Viewing Inquiries & Orders

### Option 1: Supabase Dashboard (Easiest)

1. Go to **Supabase Dashboard** → **Table Editor**
2. Click on `contact_inquiries` to see all contact form submissions
3. Click on `guest_orders` to see all orders
4. Click any row to view/edit details

### Option 2: SQL Queries

```sql
-- View all new contact inquiries
SELECT * FROM contact_inquiries 
WHERE status = 'new' 
ORDER BY created_at DESC;

-- View all pending orders
SELECT * FROM guest_orders 
WHERE status = 'pending' 
ORDER BY created_at DESC;

-- Update inquiry status after contacting
UPDATE contact_inquiries 
SET status = 'contacted', contacted_at = NOW() 
WHERE id = 'inquiry-id-here';

-- Update order status
UPDATE guest_orders 
SET status = 'contacted', contacted_at = NOW() 
WHERE id = 'order-id-here';
```

## 📋 What Gets Stored

### Contact Inquiries Table
- Customer name, email, phone
- Service type (quote, installation, consultation, other)
- Message
- Status (new, contacted, resolved, archived)
- Timestamps

### Guest Orders Table
- Customer information (name, email, phone, address)
- Order items (as JSON)
- Total amount
- Status (pending, contacted, confirmed, etc.)
- Timestamps

## 🔄 Workflow

1. **Customer submits form** → Stored in database automatically
2. **You check Supabase** → View new inquiries/orders
3. **You contact customer** → Update status to "contacted"
4. **You resolve** → Update status to "resolved" or "confirmed"

## ✨ Optional: Add Email Notifications Later

If you want email notifications in the future, you can:
1. Set up Resend (or similar) API key
2. Add environment variables
3. The code already supports it - just add the keys!

But for now, **Supabase database is all you need!**

## 🎯 Benefits

✅ **No external services needed** - Everything in Supabase  
✅ **Simple workflow** - Check dashboard, contact customers  
✅ **Free** - No email service costs  
✅ **Reliable** - Database storage is permanent  
✅ **Searchable** - Easy to find past inquiries/orders  
✅ **Scalable** - Can add email/webhooks later if needed  

## 📝 Status Management

You can update statuses directly in Supabase:

**Contact Inquiry Statuses:**
- `new` - Just received
- `contacted` - You've contacted them
- `resolved` - Inquiry completed
- `archived` - Old/completed inquiries

**Order Statuses:**
- `pending` - Just received
- `contacted` - You've contacted customer
- `confirmed` - Order confirmed
- `processing` - Preparing order
- `shipped` - Order shipped
- `delivered` - Order delivered
- `cancelled` - Order cancelled

## 🔍 Quick Tips

- **Filter by status** in Supabase Table Editor
- **Sort by date** to see newest first
- **Add admin notes** to track your conversations
- **Export data** if needed (Supabase → Export)

That's it! You're all set. Just check your Supabase dashboard regularly for new inquiries and orders.
