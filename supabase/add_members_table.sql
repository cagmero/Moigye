-- Add members tracking table
CREATE TABLE IF NOT EXISTS public.group_members (
    id                  BIGSERIAL PRIMARY KEY,
    group_id            INTEGER NOT NULL REFERENCES public.groups(group_id) ON DELETE CASCADE,
    wallet_address      TEXT NOT NULL,
    joined_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(group_id, wallet_address)
);

-- Enable RLS
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "read_members" ON public.group_members FOR SELECT USING (true);
CREATE POLICY "insert_members" ON public.group_members FOR INSERT WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_members;
