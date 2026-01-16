# MVP Checkout Setup Guide

## ✅ What's Been Implemented

Your MVP checkout system is ready! Here's what you have:

1. **Checkout Modal** - Beautiful checkout form with customer details
2. **Order API** - `/api/orders` endpoint that sends orders to webhook/email
3. **Cart Integration** - Floating cart button on products pages
4. **No Payment Required** - Customers just submit their order, you handle payment manually

## 🚀 Quick Setup (FREE Options)

### Simplest Setup: Just Email (No Webhook Needed)

Add to `.env.local`:
```env
# Email notifications (FREE - 3,000/month)
EMAIL_SERVICE=resend
RESEND_API_KEY=re_xxxxxxxxxxxxx
ORDER_NOTIFICATION_EMAIL=your-email@example.com
EMAIL_FROM=orders@innovationskirting.co.nz
```

**Done!** Orders will be emailed to you. No webhook needed.

### Advanced Setup: Add Webhook (Optional)

If you want automation (Slack, database, etc.), add:
```env
# Webhook URL (any service - see free options below)
ORDER_WEBHOOK_URL=https://your-webhook-url.com/webhook
```

### 2. Webhook Setup (FREE Options)

Your code works with **any webhook URL**. Here are free options:

#### Option A: Self-Hosted n8n (100% Free)
1. Run n8n locally or on a free VPS (Railway, Render, Fly.io)
2. Create webhook workflow
3. Get webhook URL
4. Add to `ORDER_WEBHOOK_URL`

#### Option B: Zapier Free Tier (100 requests/month)
1. Sign up at [Zapier.com](https://zapier.com) (free)
2. Create "Webhooks by Zapier" → "Catch Hook"
3. Copy webhook URL
4. Add to `ORDER_WEBHOOK_URL`
5. Connect to email/Slack/Google Sheets

#### Option C: Make.com Free Tier (1,000 ops/month)
1. Sign up at [Make.com](https://make.com) (free)
2. Create webhook scenario
3. Copy webhook URL
4. Add to `ORDER_WEBHOOK_URL`

#### Option D: Webhook.site (100% Free, Testing)
1. Go to [webhook.site](https://webhook.site)
2. Copy unique URL
3. Add to `ORDER_WEBHOOK_URL`
4. View orders in real-time (great for testing!)

#### Option E: Just Use Email (No Webhook Needed)
Skip webhook entirely - just use Resend (free tier: 3,000 emails/month)
See "Email Setup" section below.

**Order Data Format:**
```json
{
  "orderId": "ORD-1234567890",
  "orderDate": "2024-01-15T10:30:00.000Z",
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+64 9 123 4567",
    "address": "123 Main St",
    "city": "Auckland",
    "postalCode": "1010"
  },
  "items": [
    {
      "productName": "SK-100 Classic",
      "productSlug": "sk-100-classic",
      "price": 89,
      "length": 5,
      "quantity": 2,
      "subtotal": 890
    }
  ],
  "total": 890.00,
  "notes": "Please deliver on weekends",
  "status": "pending"
}
```

### 3. Email Setup (FREE - Recommended for MVP)

**Easiest option - just use email!** No webhook needed.

1. Sign up at [Resend.com](https://resend.com) (free tier: **3,000 emails/month**)
2. Get your API key
3. Add to `.env.local`:
   ```env
   EMAIL_SERVICE=resend
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   ORDER_NOTIFICATION_EMAIL=your-email@example.com
   EMAIL_FROM=orders@innovationskirting.co.nz
   ```

**That's it!** Orders will be emailed directly to you. No webhook needed.

#### Alternative Free Email Services:
- **SendGrid** - 100 emails/day free
- **Mailgun** - 5,000 emails/month free (first 3 months)
- **Postmark** - 100 emails/month free

## 📋 How It Works

### Customer Flow:
1. Customer browses products
2. Adds items to cart (with length & quantity)
3. Clicks floating "Checkout" button
4. Fills out customer information form
5. Submits order
6. Gets confirmation message
7. **You receive order via webhook/email**
8. You contact them to arrange payment manually

### Your Flow:
1. Receive order notification (webhook/email)
2. Review order details
3. Contact customer to confirm
4. Arrange payment (bank transfer, invoice, etc.)
5. Fulfill order
6. Update order status (if you add tracking)

## 🎨 Features

- ✅ **Cart Management** - Add/remove items, adjust quantities
- ✅ **Length & Quantity** - Customers specify meters and quantity
- ✅ **Order Summary** - Shows all items with prices
- ✅ **Customer Form** - Name, email, phone, address
- ✅ **Webhook Integration** - Sends to n8n or any webhook
- ✅ **Email Notifications** - Optional email alerts
- ✅ **No Payment Gateway** - Simple MVP approach
- ✅ **Mobile Responsive** - Works on all devices

## 🔧 Customization

### Change Webhook URL
Update `ORDER_WEBHOOK_URL` in `.env.local`

### Customize Email Template
Edit `generateOrderEmail()` function in `app/api/orders/route.ts`

### Add More Fields
Edit `components/checkout-modal.tsx` to add custom fields

### Change Order Format
Modify the order data structure in `app/api/orders/route.ts`

## 🧪 Testing

1. Add products to cart
2. Click checkout button
3. Fill out form
4. Submit order
5. Check your webhook/email for order notification

## 📝 Next Steps (Optional)

- Add order tracking page
- Save orders to database
- Add order history for customers
- Integrate payment gateway (Stripe, etc.)
- Add order status updates
- Create admin dashboard for orders

## 🐛 Troubleshooting

**Orders not being received?**
- Check `ORDER_WEBHOOK_URL` is correct
- Test webhook URL with a tool like Postman
- Check server logs for errors

**Email not working?**
- Verify `RESEND_API_KEY` is correct
- Check Resend dashboard for delivery status
- Ensure `EMAIL_SERVICE=resend` is set

**Modal not opening?**
- Check browser console for errors
- Verify cart has items
- Check that `CheckoutModal` is imported

---

**You're ready to launch!** 🚀

Just set up your webhook URL and start receiving orders.
