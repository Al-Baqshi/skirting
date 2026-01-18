-- ============================================================================
-- ENABLE REALTIME FOR ORDERS AND INQUIRIES
-- ============================================================================
-- This enables Supabase Realtime subscriptions for the guest_orders and
-- contact_inquiries tables so admins can receive instant notifications
-- ============================================================================

-- Enable Realtime for guest_orders table (only if not already enabled)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'guest_orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.guest_orders;
  END IF;
END $$;

-- Enable Realtime for contact_inquiries table (only if not already enabled)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'contact_inquiries'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.contact_inquiries;
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- To verify Realtime is enabled, run:
-- SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
-- 
-- You should see both 'guest_orders' and 'contact_inquiries' in the results.
-- ============================================================================
