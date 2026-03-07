-- Update users table for Sybil-Resistance
ALTER TABLE users ADD COLUMN IF NOT EXISTS privy_did TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;

-- Create an index for faster lookups by DID
CREATE INDEX IF NOT EXISTS idx_users_privy_did ON users(privy_did);
