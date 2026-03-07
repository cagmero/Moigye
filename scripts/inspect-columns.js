import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://rfzopdbbwujrohkxenmt.supabase.co";
const SUPABASE_KEY = "sb_publishable_bLrk1KD7_JxCiwW2kB4XbA_lyqgxO9l";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspect() {
    console.log("--- Users table ---");
    const { data: uData, error: uError } = await supabase.from('users').select('*').limit(1);
    if (uError) console.log("Users error:", uError.message);
    else if (uData.length > 0) console.log("Users columns:", Object.keys(uData[0]));
    else console.log("Users table is empty.");

    console.log("\n--- Groups table ---");
    const { data: gData, error: gError } = await supabase.from('groups').select('*').limit(1);
    if (gError) console.log("Groups error:", gError.message);
    else if (gData.length > 0) console.log("Groups columns:", Object.keys(gData[0]));
    else console.log("Groups table is empty.");
}

inspect();
