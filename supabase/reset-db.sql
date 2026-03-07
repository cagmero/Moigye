-- ================================================================
-- Moigye Protocol — DATABASE RESET
-- WARNING: This will delete ALL existing data in the following tables!
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ================================================================

-- 1. Drop existing tables and functions to ensure a clean slate
DROP TABLE IF EXISTS public.live_bids CASCADE;
DROP TABLE IF EXISTS public.bid_history CASCADE;
DROP TABLE IF EXISTS public.groups CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

DROP FUNCTION IF EXISTS public.increment_score(TEXT, INTEGER);
DROP FUNCTION IF EXISTS public.apply_default_penalty(TEXT);

-- 2. User Registry
CREATE TABLE public.users (
    wallet_address  TEXT PRIMARY KEY,
    privy_did       TEXT,
    is_banned       BOOLEAN NOT NULL DEFAULT false,
    score           INTEGER NOT NULL DEFAULT 300,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Groups
CREATE TABLE public.groups (
    group_id            INTEGER PRIMARY KEY,
    moderator           TEXT NOT NULL,
    is_auction_started  BOOLEAN NOT NULL DEFAULT false,
    fixed_deposit       NUMERIC,
    max_participants    INTEGER,
    is_public           BOOLEAN NOT NULL DEFAULT true,
    min_score_required  INTEGER NOT NULL DEFAULT 300,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Live Bids
CREATE TABLE public.live_bids (
    id                  BIGSERIAL PRIMARY KEY,
    group_id            INTEGER NOT NULL REFERENCES public.groups(group_id) ON DELETE CASCADE,
    wallet_address      TEXT NOT NULL,
    discount_amount     NUMERIC NOT NULL,
    placed_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX live_bids_group_wallet_idx ON public.live_bids(group_id, wallet_address);

-- 5. Bid History
CREATE TABLE public.bid_history (
    id                  BIGSERIAL PRIMARY KEY,
    group_id            INTEGER NOT NULL,
    wallet_address      TEXT NOT NULL,
    discount_amount     NUMERIC NOT NULL,
    did_win             BOOLEAN NOT NULL DEFAULT false,
    round_number        INTEGER NOT NULL DEFAULT 1,
    completed_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Enable Realtime
-- (Note: If these fail because table already exists in publication, it's fine)
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_bids;
ALTER PUBLICATION supabase_realtime ADD TABLE public.groups;
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;

-- 7. RLS Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bid_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read_users"   ON public.users FOR SELECT USING (true);
CREATE POLICY "upsert_users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "update_users" ON public.users FOR UPDATE USING (true);

CREATE POLICY "read_groups"   ON public.groups FOR SELECT USING (true);
CREATE POLICY "insert_groups" ON public.groups FOR INSERT WITH CHECK (true);
CREATE POLICY "update_groups" ON public.groups FOR UPDATE USING (true);

CREATE POLICY "read_live_bids"   ON public.live_bids FOR SELECT USING (true);
CREATE POLICY "insert_live_bids" ON public.live_bids FOR INSERT WITH CHECK (true);
CREATE POLICY "delete_live_bids" ON public.live_bids FOR DELETE USING (true);

CREATE POLICY "read_bid_history"   ON public.bid_history FOR SELECT USING (true);
CREATE POLICY "insert_bid_history" ON public.bid_history FOR INSERT WITH CHECK (true);

-- 8. RPC Functions
CREATE OR REPLACE FUNCTION public.increment_score(p_wallet TEXT, p_amount INTEGER)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE public.users SET score = LEAST(1000, score + p_amount)
    WHERE wallet_address = LOWER(p_wallet);
END; $$;

CREATE OR REPLACE FUNCTION public.apply_default_penalty(p_wallet TEXT)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE public.users
    SET score = GREATEST(0, score - 150),
        is_banned = CASE WHEN (score - 150) <= 0 THEN true ELSE is_banned END
    WHERE wallet_address = LOWER(p_wallet);
END; $$;

-- 9. Force Reload
NOTIFY pgrst, 'reload schema';
