-- Create users table
CREATE TABLE users (
    wallet_address TEXT PRIMARY KEY,
    privy_id TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create groups table
CREATE TABLE groups (
    id BIGINT PRIMARY KEY, -- matches on-chain ID
    name TEXT NOT NULL,
    is_public BOOLEAN DEFAULT true,
    fixed_deposit BIGINT NOT NULL,
    total_pot BIGINT DEFAULT 0,
    bidding_date TIMESTAMPTZ NOT NULL,
    moderator_address TEXT NOT NULL REFERENCES users(wallet_address)
);

-- Create group_requests table
CREATE TABLE group_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id BIGINT REFERENCES groups(id) ON DELETE CASCADE,
    wallet_address TEXT REFERENCES users(wallet_address),
    status TEXT CHECK (status IN ('pending', 'approved', 'declined')) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(group_id, wallet_address)
);

-- Create live_bids table
CREATE TABLE live_bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id BIGINT REFERENCES groups(id) ON DELETE CASCADE,
    wallet_address TEXT REFERENCES users(wallet_address),
    discount_amount BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_bids ENABLE ROW LEVEL SECURITY;

-- Policies for users
CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update their own record" ON users FOR UPDATE USING (auth.uid()::text = privy_id);
CREATE POLICY "Users can insert their own record" ON users FOR INSERT WITH CHECK (true);

-- Policies for groups
CREATE POLICY "Groups are viewable by everyone" ON groups FOR SELECT USING (true);
CREATE POLICY "Moderators can update their groups" ON groups FOR UPDATE USING (moderator_address = (SELECT wallet_address FROM users WHERE privy_id = auth.uid()::text));
CREATE POLICY "Moderators can insert groups" ON groups FOR INSERT WITH CHECK (true);

-- Policies for group_requests
CREATE POLICY "Group requests are viewable by moderator and requester" ON group_requests 
FOR SELECT USING (
    wallet_address = (SELECT wallet_address FROM users WHERE privy_id = auth.uid()::text) OR 
    (SELECT moderator_address FROM groups WHERE id = group_id) = (SELECT wallet_address FROM users WHERE privy_id = auth.uid()::text)
);
CREATE POLICY "Users can insert join requests" ON group_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Moderators can update request status" ON group_requests FOR UPDATE USING (
    (SELECT moderator_address FROM groups WHERE id = group_id) = (SELECT wallet_address FROM users WHERE privy_id = auth.uid()::text)
);

-- Policies for live_bids
CREATE POLICY "Live bids are viewable by everyone" ON live_bids FOR SELECT USING (true);
CREATE POLICY "Users can insert bids" ON live_bids FOR INSERT WITH CHECK (true);

-- Enable Realtime for live_bids
ALTER PUBLICATION supabase_realtime ADD TABLE live_bids;
ALTER PUBLICATION supabase_realtime ADD TABLE groups;
ALTER PUBLICATION supabase_realtime ADD TABLE group_requests;
