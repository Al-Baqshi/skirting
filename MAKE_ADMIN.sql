-- ============================================================================
-- QUICK SCRIPT TO MAKE A USER AN ADMIN
-- ============================================================================
-- Replace 'your-email@example.com' with the actual email address
-- OR replace the UUID with the actual user UUID
-- ============================================================================

-- Method 1: By Email (Easier)
UPDATE public.user_profiles 
SET role = 'admin', is_active = true
WHERE email = 'your-email@example.com';

-- Method 2: By User UUID
-- UPDATE public.user_profiles 
-- SET role = 'admin', is_active = true
-- WHERE id = 'USER_UUID_HERE';

-- Verify the change
SELECT id, email, full_name, role, is_active 
FROM public.user_profiles 
WHERE role = 'admin';
