import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://rfzopdbbwujrohkxenmt.supabase.co";
const SUPABASE_KEY = "sb_publishable_bLrk1KD7_JxCiwW2kB4XbA_lyqgxO9l";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false }
});

async function check() {
    console.log("Checking USERS...");
    const { data: users, error: uError } = await supabase.from('users').select('wallet_address, score').limit(5);
    if (uError) {
        console.error("  USERS Error:", uError.message, uError.details, uError.hint);
    } else {
        console.log(`  USERS Found: ${users.length} rows`);
        users.forEach(u => console.log(`  - ${u.wallet_address}: ${u.score}`));
    }

    console.log("\nChecking GROUPS...");
    const { data: groups, error: gError } = await supabase.from('groups').select('group_id, min_score_required').limit(5);
    if (gError) {
        console.error("  GROUPS Error:", gError.message);
    } else {
        console.log(`  GROUPS Found: ${groups.length} rows`);
    }

    console.log("\nChecking BID_HISTORY...");
    const { count, error: bError } = await supabase.from('bid_history').select('*', { count: 'exact', head: true });
    if (bError) {
        console.error("  BID_HISTORY Error:", bError.message);
    } else {
        console.log(`  BID_HISTORY Count: ${count}`);
    }
}

check();
