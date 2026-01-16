# 🆓 Free Webhook & Automation Options

Since trigger.dev isn't free, here are **100% free alternatives** that work with your checkout system:

## ✅ Recommended: Email Only (Simplest)

**Just use Resend** - No webhook needed!

```env
EMAIL_SERVICE=resend
RESEND_API_KEY=re_xxxxxxxxxxxxx
ORDER_NOTIFICATION_EMAIL=your-email@example.com
```

- ✅ **3,000 emails/month free**
- ✅ **No setup complexity**
- ✅ **Works immediately**
- ✅ **Professional HTML emails**

---

## 🆓 Free Webhook Services

### 1. **Zapier Free Tier**
- **100 webhook requests/month** (free)
- Easy setup
- Connect to 6,000+ apps
- **Setup:**
  1. Sign up at [zapier.com](https://zapier.com)
  2. Create "Webhooks by Zapier" → "Catch Hook"
  3. Copy webhook URL
  4. Add to `ORDER_WEBHOOK_URL`

### 2. **Make.com (Integromat) Free Tier**
- **1,000 operations/month** (free)
- More powerful than Zapier
- Visual workflow builder
- **Setup:**
  1. Sign up at [make.com](https://make.com)
  2. Create webhook scenario
  3. Copy webhook URL
  4. Add to `ORDER_WEBHOOK_URL`

### 3. **Webhook.site (Testing)**
- **100% free, unlimited**
- Perfect for testing
- See requests in real-time
- **Setup:**
  1. Go to [webhook.site](https://webhook.site)
  2. Copy unique URL
  3. Add to `ORDER_WEBHOOK_URL`
  4. View orders instantly

### 4. **Self-Hosted n8n (100% Free)**
- **Unlimited** (self-hosted)
- Most powerful option
- Full automation control
- **Setup:**
  - Run on Railway (free tier)
  - Run on Render (free tier)
  - Run on Fly.io (free tier)
  - Or run locally with Docker

### 5. **Pipedream Free Tier**
- **100 invocations/day** (free)
- Code-based workflows
- Great for developers
- **Setup:**
  1. Sign up at [pipedream.com](https://pipedream.com)
  2. Create webhook workflow
  3. Copy webhook URL
  4. Add to `ORDER_WEBHOOK_URL`

---

## 💡 Recommended Setup for MVP

### Option 1: Email Only (Easiest)
```env
EMAIL_SERVICE=resend
RESEND_API_KEY=re_xxxxxxxxxxxxx
ORDER_NOTIFICATION_EMAIL=your-email@example.com
```
**Pros:** Simple, reliable, free  
**Cons:** No automation

### Option 2: Email + Webhook.site (Testing)
```env
EMAIL_SERVICE=resend
RESEND_API_KEY=re_xxxxxxxxxxxxx
ORDER_NOTIFICATION_EMAIL=your-email@example.com
ORDER_WEBHOOK_URL=https://webhook.site/your-unique-id
```
**Pros:** See orders in real-time + get emails  
**Cons:** Webhook.site is for testing only

### Option 3: Email + Zapier (Production)
```env
EMAIL_SERVICE=resend
RESEND_API_KEY=re_xxxxxxxxxxxxx
ORDER_NOTIFICATION_EMAIL=your-email@example.com
ORDER_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/xxxxx/xxxxx
```
**Pros:** Can automate to Slack, Google Sheets, etc.  
**Cons:** 100 requests/month limit (free tier)

---

## 🎯 What I Recommend

**For MVP launch:**
1. Start with **email only** (Resend)
2. Test with **webhook.site** to see orders
3. Later, add **Zapier** if you need automation

**For production:**
1. **Email** (Resend) - primary notifications
2. **Zapier/Make.com** - automation (Slack, database, etc.)
3. Or **self-hosted n8n** - unlimited automation

---

## 🔧 Your Code Works With All of These!

Your `/api/orders` route accepts **any webhook URL**. Just set `ORDER_WEBHOOK_URL` and it works!

No code changes needed - just swap the URL. 🚀
