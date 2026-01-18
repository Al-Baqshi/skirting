# Real-time Notifications Setup

## Overview
The admin dashboard now has real-time notifications that alert you when:
- A new order is placed
- A new contact inquiry is submitted

You'll hear a "ding" sound and see a toast notification when these events occur.

## Setup Instructions

### 1. Enable Realtime in Supabase

You need to enable Realtime for the `guest_orders` and `contact_inquiries` tables.

#### Option A: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **Database** → **Replication**
3. Find the following tables:
   - `guest_orders`
   - `contact_inquiries`
4. Toggle them **ON** to enable Realtime

#### Option B: Using SQL Migration
Run the migration file:
```bash
supabase migration up
```

Or manually run this SQL in the Supabase SQL Editor:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.guest_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contact_inquiries;
```

### 2. Verify It's Working

1. Log in to the admin dashboard at `/admin/orders`
2. Open the browser console (F12)
3. You should see:
   - `✅ Listening for new orders...`
   - `✅ Listening for new inquiries...`

### 3. Test the Notifications

1. Keep the admin dashboard open
2. In another browser/incognito window, submit:
   - A test order via the checkout
   - A test contact form submission
3. You should:
   - Hear a "ding" sound
   - See a toast notification
   - The data should automatically refresh

## Troubleshooting

### No Sound Playing
- Check browser permissions for audio
- Some browsers require user interaction before playing sounds
- Try clicking anywhere on the page first

### Notifications Not Appearing
- Check browser console for errors
- Verify Realtime is enabled in Supabase Dashboard
- Make sure you're logged in as admin
- Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set correctly

### Connection Issues
- Check your internet connection
- Verify Supabase project is active
- Check Supabase dashboard for any service status issues

## How It Works

The system uses:
- **Supabase Realtime**: Listens for database changes via WebSocket
- **Web Audio API**: Generates notification sounds without external files
- **Sonner Toast**: Shows visual notifications
- **Automatic Refresh**: Updates the order/inquiry list when new items arrive

## Customization

You can customize the notification behavior in:
- `hooks/use-realtime-notifications.ts` - Notification logic
- `lib/notification-sound.ts` - Sound settings
