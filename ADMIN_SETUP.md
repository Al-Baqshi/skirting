# Admin PIN Protection Setup

## Overview

The admin section is now protected with a PIN code system. This prevents unauthorized access to the product management page.

## Setup Instructions

### 1. Set Admin PIN

Add the following environment variable to your `.env.local` file:

```env
ADMIN_PIN=your-secure-pin-here
```

**Important:** 
- Use a strong PIN (at least 4-6 digits/characters)
- Don't commit this to version control
- Change the default PIN in production

### 2. Default PIN

If `ADMIN_PIN` is not set, the default PIN is `1234`. **You should change this immediately!**

### 3. How It Works

1. When someone visits `/admin/products`, they'll see a PIN entry screen
2. After entering the correct PIN, they get a secure cookie that lasts 24 hours
3. All admin API routes check for this authentication cookie
4. The cookie is httpOnly (not accessible via JavaScript) and secure in production

### 4. Accessing Admin

1. Navigate to `/admin/products`
2. Enter your PIN code
3. You'll be authenticated for 24 hours
4. After 24 hours, you'll need to re-enter the PIN

### 5. Security Notes

- The PIN is stored server-side in environment variables
- Authentication uses secure HTTP-only cookies
- All admin API routes are protected
- The cookie expires after 24 hours for security

## Contact Form Setup

The contact form is now functional and will:

1. Submit to `/api/contact`
2. Send to webhook if `CONTACT_WEBHOOK_URL` is set
3. Send email if `EMAIL_SERVICE=resend` and `RESEND_API_KEY` is configured

### Optional Environment Variables

```env
# Receive order + contact notifications at one address (easiest)
ADMIN_EMAIL=your-email@example.com

# Or separate addresses
ORDER_NOTIFICATION_EMAIL=your-email@example.com
CONTACT_NOTIFICATION_EMAIL=your-email@example.com

# Email service (required for notifications)
EMAIL_SERVICE=resend
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=notifications@yourdomain.com   # Must be verified in Resend

# Webhooks (optional)
CONTACT_WEBHOOK_URL=https://your-webhook-url.com
ORDER_WEBHOOK_URL=https://your-order-webhook-url.com
```

## Testing

1. **Test Admin Protection:**
   - Visit `/admin/products` without PIN → Should show PIN screen
   - Enter wrong PIN → Should show error
   - Enter correct PIN → Should access admin page

2. **Test Contact Form:**
   - Fill out contact form at `/contact`
   - Submit → Should show success message
   - Check webhook/email if configured

## Troubleshooting

- **PIN not working?** Check that `ADMIN_PIN` is set correctly in `.env.local`
- **Contact form not submitting?** Check browser console for errors
- **Cookies not working?** Ensure you're not in incognito mode and cookies are enabled
