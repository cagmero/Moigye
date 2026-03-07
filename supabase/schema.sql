-- ================================================================
-- Moigye Protocol — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ================================================================

-- 1. User Registry
CREATE TABLE IF NOT EXISTS public.users (
    wallet_address  TEXT PRIMARY KEY,
    privy_did       TEXT,
    is_banned       BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Groups (mirrors on-chain state for fast UI queries)
CREATE TABLE IF NOT EXISTS public.groups (
    group_id            INTEGER PRIMARY KEY,
    moderator           TEXT NOT NULL,
    is_auction_started  BOOLEAN NOT NULL DEFAULT false,
    fixed_deposit       NUMERIC,
    max_participants    INTEGER,
    is_public           BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Live Bids (active bids during an open round — cleared after settlement)
CREATE TABLE IF NOT EXISTS public.live_bids (
    id                  BIGSERIAL PRIMARY KEY,
    group_id            INTEGER NOT NULL REFERENCES public.groups(group_id) ON DELETE CASCADE,
    wallet_address      TEXT NOT NULL,
    discount_amount     NUMERIC NOT NULL,
    placed_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique constraint: one active bid per wallet per group
CREATE UNIQUE INDEX IF NOT EXISTS live_bids_group_wallet_idx ON public.live_bids(group_id, wallet_address);

-- 4. Bid History (permanent archive of all settled rounds)
CREATE TABLE IF NOT EXISTS public.bid_history (
    id                  BIGSERIAL PRIMARY KEY,
    group_id            INTEGER NOT NULL,
    wallet_address      TEXT NOT NULL,
    discount_amount     NUMERIC NOT NULL,
    did_win             BOOLEAN NOT NULL DEFAULT false,
    round_number        INTEGER NOT NULL DEFAULT 1,
    completed_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------
-- Enable Realtime on live_bids so LiveArena subscribes to changes
-- ----------------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_bids;
ALTER PUBLICATION supabase_realtime ADD TABLE public.groups;

-- ----------------------------------------------------------------
-- Row Level Security (RLS) — allow public read, authenticated write
-- ----------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bid_history ENABLE ROW LEVEL SECURITY;

-- Users: anon can read, anyone can upsert their own row
CREATE POLICY "read_users" ON public.users FOR SELECT USING (true);
CREATE POLICY "upsert_users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "update_users" ON public.users FOR UPDATE USING (true);

-- Groups: anyone can read, insert, update (for now — restrict per address in production)
CREATE POLICY "read_groups" ON public.groups FOR SELECT USING (true);
CREATE POLICY "insert_groups" ON public.groups FOR INSERT WITH CHECK (true);
CREATE POLICY "update_groups" ON public.groups FOR UPDATE USING (true);

-- Live bids: full public access (anyone in the group can bid)
CREATE POLICY "read_live_bids" ON public.live_bids FOR SELECT USING (true);
CREATE POLICY "insert_live_bids" ON public.live_bids FOR INSERT WITH CHECK (true);

-- Bid history: read only for everyone
CREATE POLICY "read_bid_history" ON public.bid_history FOR SELECT USING (true);
CREATE POLICY "insert_bid_history" ON public.bid_history FOR INSERT WITH CHECK (true);
