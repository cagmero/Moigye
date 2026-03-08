-- ================================================================
-- Moigye Optimized Schema - Off-Chain First Architecture
-- Run this AFTER the existing schema to add new columns/tables
-- ================================================================

-- 1. Add phase tracking to groups (replaces on-chain phase reads)
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS phase INTEGER NOT NULL DEFAULT 0;
-- Phase: 0=Idle, 1=Deposit, 2=Bidding, 3=Voting, 4=FinalChallenge, 5=Completed

ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS current_round INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS phase_updated_at TIMESTAMPTZ DEFAULT now();

-- 2. Track deposits (who has deposited and is eligible to bid)
CREATE TABLE IF NOT EXISTS public.deposits (
    id                  BIGSERIAL PRIMARY KEY,
    group_id            INTEGER NOT NULL REFERENCES public.groups(group_id) ON DELETE CASCADE,
    wallet_address      TEXT NOT NULL,
    amount              NUMERIC NOT NULL,
    tx_hash             TEXT,
    deposited_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(group_id, wallet_address)
);

-- 3. Add winner tracking to bid_history
ALTER TABLE public.bid_history ADD COLUMN IF NOT EXISTS payout_tx_hash TEXT;
ALTER TABLE public.bid_history ADD COLUMN IF NOT EXISTS payout_executed BOOLEAN NOT NULL DEFAULT false;

-- 4. Add voting table (replaces on-chain voting)
CREATE TABLE IF NOT EXISTS public.votes (
    id                  BIGSERIAL PRIMARY KEY,
    group_id            INTEGER NOT NULL REFERENCES public.groups(group_id) ON DELETE CASCADE,
    round_number        INTEGER NOT NULL,
    wallet_address      TEXT NOT NULL,
    is_satisfied        BOOLEAN NOT NULL,
    voted_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(group_id, round_number, wallet_address)
);

-- Enable RLS
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "read_deposits" ON public.deposits FOR SELECT USING (true);
CREATE POLICY "insert_deposits" ON public.deposits FOR INSERT WITH CHECK (true);

CREATE POLICY "read_votes" ON public.votes FOR SELECT USING (true);
CREATE POLICY "insert_votes" ON public.votes FOR INSERT WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.deposits;
ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;

-- ================================================================
-- Helper Functions
-- ================================================================

-- Update phase (called by moderator)
CREATE OR REPLACE FUNCTION public.update_group_phase(
    p_group_id INTEGER,
    p_new_phase INTEGER,
    p_moderator TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.groups
    SET phase = p_new_phase,
        phase_updated_at = now()
    WHERE group_id = p_group_id
      AND moderator = LOWER(p_moderator);
END;
$$;

-- Get current highest bidder
CREATE OR REPLACE FUNCTION public.get_highest_bidder(p_group_id INTEGER)
RETURNS TABLE(wallet_address TEXT, discount_amount NUMERIC)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT lb.wallet_address, lb.discount_amount
    FROM public.live_bids lb
    WHERE lb.group_id = p_group_id
    ORDER BY lb.discount_amount DESC
    LIMIT 1;
END;
$$;

-- Finalize round (move live_bids to history, select winner)
CREATE OR REPLACE FUNCTION public.finalize_round(
    p_group_id INTEGER,
    p_round_number INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_winner TEXT;
    v_discount NUMERIC;
BEGIN
    -- Get winner
    SELECT wallet_address, discount_amount INTO v_winner, v_discount
    FROM public.live_bids
    WHERE group_id = p_group_id
    ORDER BY discount_amount DESC
    LIMIT 1;

    -- Archive all bids
    INSERT INTO public.bid_history (group_id, wallet_address, discount_amount, did_win, round_number)
    SELECT group_id, wallet_address, discount_amount, 
           (wallet_address = v_winner), p_round_number
    FROM public.live_bids
    WHERE group_id = p_group_id;

    -- Clear live bids
    DELETE FROM public.live_bids WHERE group_id = p_group_id;

    -- Update group phase
    UPDATE public.groups
    SET phase = 5, -- Completed
        current_round = current_round + 1,
        phase_updated_at = now()
    WHERE group_id = p_group_id;
END;
$$;
