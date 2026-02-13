-- Add payment fields to guest_orders for admin to record payments and send invoice/status emails
-- Run this in Supabase Dashboard → SQL Editor if you haven't applied migrations via CLI.

ALTER TABLE public.guest_orders
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid', 'partial', 'paid'));

ALTER TABLE public.guest_orders
  ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10, 2);

ALTER TABLE public.guest_orders
  ADD COLUMN IF NOT EXISTS payment_method TEXT;

ALTER TABLE public.guest_orders
  ADD COLUMN IF NOT EXISTS transaction_reference TEXT;

ALTER TABLE public.guest_orders
  ADD COLUMN IF NOT EXISTS payment_date DATE;

ALTER TABLE public.guest_orders
  ADD COLUMN IF NOT EXISTS payment_notes TEXT;

COMMENT ON COLUMN public.guest_orders.payment_status IS 'unpaid | partial | paid';
COMMENT ON COLUMN public.guest_orders.amount_paid IS 'Amount paid so far (for partial/full)';
COMMENT ON COLUMN public.guest_orders.payment_method IS 'e.g. Bank transfer, Card, Cash';
COMMENT ON COLUMN public.guest_orders.transaction_reference IS 'Bank or transaction reference number';
COMMENT ON COLUMN public.guest_orders.payment_date IS 'Date of payment';
COMMENT ON COLUMN public.guest_orders.payment_notes IS 'Admin note about payment';
