import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://rfzopdbbwujrohkxenmt.supabase.co";
const SUPABASE_KEY = "sb_publishable_bLrk1KD7_JxCiwW2kB4XbA_lyqgxO9l";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testInsert() {
    console.log("Attempting test insert into GROUPS...");
    // Try to insert a row with a completely random column to see what columns it suggests
    const { error } = await supabase.from('groups').insert([{ dummy_col: 1 }]);
    if (error) {
        console.log("Insert failed as expected.");
        console.log("Message:", error.message);
        console.log("Details:", error.details);
        console.log("Hint:", error.hint);
    } else {
        console.log("Insert somehow succeeded?? (This shouldn't happen)");
    }
}
testInsert();
