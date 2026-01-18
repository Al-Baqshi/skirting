-- Verify Realtime is enabled for both tables
SELECT 
  tablename,
  CASE 
    WHEN tablename IN ('guest_orders', 'contact_inquiries') THEN '✅ Enabled'
    ELSE '❌ Not found'
  END as status
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
  AND tablename IN ('guest_orders', 'contact_inquiries')
ORDER BY tablename;
