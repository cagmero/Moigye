-- ================================================================
-- Moigye Protocol — Schema Migration
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- This adds missing columns to existing tables.
-- ================================================================

-- Add score column to users (new users start at 300)
ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS score INTEGER NOT NULL DEFAULT 300;

-- Add min_score_required column to groups
ALTER TABLE public.groups
    ADD COLUMN IF NOT EXISTS min_score_required INTEGER NOT NULL DEFAULT 300;

-- Add delete policy for live_bids if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'live_bids' AND policyname = 'delete_live_bids'
    ) THEN
        EXECUTE 'CREATE POLICY "delete_live_bids" ON public.live_bids FOR DELETE USING (true)';
    END IF;
END $$;

-- Create the score RPC functions (idempotent)
CREATE OR REPLACE FUNCTION public.increment_score(p_wallet TEXT, p_amount INTEGER)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE public.users
    SET score = LEAST(1000, score + p_amount)
    WHERE wallet_address = LOWER(p_wallet);
END;
$$;

CREATE OR REPLACE FUNCTION public.apply_default_penalty(p_wallet TEXT)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE public.users
    SET score    = GREATEST(0, score - 150),
        is_banned = CASE WHEN (score - 150) <= 0 THEN true ELSE is_banned END
    WHERE wallet_address = LOWER(p_wallet);
END;
$$;

-- Enable realtime on users table
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
