import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://rfzopdbbwujrohkxenmt.supabase.co";
const SUPABASE_KEY = "sb_publishable_bLrk1KD7_JxCiwW2kB4XbA_lyqgxO9l";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspect() {
    console.log("Inspecting USERS...");
    const { data: u, error: ue } = await supabase.from('users').select('*').limit(1);
    if (ue) console.error("Users error:", ue.message);
    else console.log("Users schema ok. Columns: ", u.length > 0 ? Object.keys(u[0]) : "Empty table (columns unknown)");

    console.log("\nInspecting GROUPS...");
    // Try to get just the column names by selecting *
    const { data: g, error: ge } = await supabase.from('groups').select('*').limit(1);
    if (ge) {
        console.error("Groups error selecting *:", ge.message);
        // Maybe try to select common names?
        const { data: g2, error: ge2 } = await supabase.from('groups').select('id').limit(1);
        if (!ge2) console.log("Found 'id' column in groups");
    } else {
        console.log("Groups schema ok. Columns: ", g.length > 0 ? Object.keys(g[0]) : "Empty table (columns unknown)");
    }
}
inspect();
