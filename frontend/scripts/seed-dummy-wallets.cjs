// scripts/seed-dummy-wallets.cjs
// CommonJS format to avoid ESM top-level await libuv crash on Node v24 Windows
// Run: node scripts/seed-dummy-wallets.cjs

const crypto = require("crypto");
const https = require("https");

// ── Supabase REST ─────────────────────────────────────────────────────────────
const SUPABASE_URL = "rfzopdbbwujrohkxenmt.supabase.co";
const SUPABASE_KEY = "sb_publishable_bLrk1KD7_JxCiwW2kB4XbA_lyqgxO9l";

function supabasePost(table, rows, upsertColumn) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify(rows);
        const prefer = upsertColumn
            ? "resolution=merge-duplicates,return=representation"
            : "return=representation";
        const path = upsertColumn
            ? `/rest/v1/${table}?on_conflict=${upsertColumn}`
            : `/rest/v1/${table}`;

        const opts = {
            hostname: SUPABASE_URL,
            path,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(body),
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${SUPABASE_KEY}`,
                "Prefer": prefer,
            },
        };

        const req = https.request(opts, (res) => {
            let data = "";
            res.on("data", (c) => (data += c));
            res.on("end", () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try { resolve(JSON.parse(data)); }
                    catch { resolve([]); }
                } else {
                    reject(new Error(`POST /${table} HTTP ${res.statusCode}: ${data}`));
                }
            });
        });
        req.on("error", reject);
        req.write(body);
        req.end();
    });
}

// ── Wallet generation ─────────────────────────────────────────────────────────
function generateAddress() {
    return "0x" + crypto.randomBytes(20).toString("hex");
}

// ── Dummy profiles ────────────────────────────────────────────────────────────
const PROFILES = [
    { label: "Tier 1 — Newcomer", score: 320, wins: 0, rounds: 2, avgBid: 100 },
    { label: "Tier 1 — Newcomer Growing", score: 380, wins: 1, rounds: 5, avgBid: 200 },
    { label: "Tier 2 — Active Member", score: 450, wins: 3, rounds: 10, avgBid: 500 },
    { label: "Tier 2 — Active Member+", score: 570, wins: 5, rounds: 15, avgBid: 800 },
    { label: "Tier 3 — Circle Elder", score: 650, wins: 8, rounds: 22, avgBid: 1500 },
    { label: "Tier 3 — Circle Elder+", score: 750, wins: 12, rounds: 30, avgBid: 3000 },
    { label: "Tier 4 — Protocol Guardian", score: 820, wins: 18, rounds: 40, avgBid: 5000 },
    { label: "Tier 5 — Protocol Legend", score: 1000, wins: 30, rounds: 60, avgBid: 9000 },
];

function rnd(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgo(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString();
}

// ── Main (self-calling async function, no top-level await) ────────────────────
(async function main() {
    console.log("🔑 Generating dummy wallets...\n");

    const wallets = PROFILES.map((profile, i) => ({
        address: generateAddress(),
        profile,
        idx: i + 1,
    }));

    wallets.forEach(({ address, profile, idx }) => {
        console.log(`  [${idx}] ${profile.label}`);
        console.log(`      ${address}  (score: ${profile.score})\n`);
    });

    // ── Upsert users ──────────────────────────────────────────────────────────
    console.log("📝 Upserting users...");
    const userRows = wallets.map(({ address, profile, idx }) => ({
        wallet_address: address,
        privy_did: `dummy_wallet_${idx}`,
        score: profile.score,
        is_banned: false,
    }));

    const inserted = await supabasePost("users", userRows, "wallet_address");
    console.log(`✅ Upserted ${inserted.length} users\n`);

    // ── Insert dummy groups (satisfies bid_history FK) ────────────────────────
    console.log("🏛️  Inserting dummy groups (IDs 1–10)...");
    const groupRows = Array.from({ length: 10 }, (_, i) => ({
        group_id: i + 1,
        moderator: wallets[i % wallets.length].address,
        is_auction_started: i < 5,          // first 5 are "started"
        fixed_deposit: [100, 250, 500, 1000, 2000, 3000, 5000, 7500, 10000, 20000][i],
        max_participants: rnd(5, 20),
        is_public: true,
        min_score_required: [300, 300, 300, 400, 400, 600, 600, 800, 800, 800][i],
    }));
    const insertedGroups = await supabasePost("groups", groupRows, "group_id");
    console.log(`✅ Upserted ${insertedGroups.length} groups\n`);

    // ── Build bid history ─────────────────────────────────────────────────────
    console.log("📜 Inserting bid history...");
    const historyRows = [];
    for (const { address, profile } of wallets) {
        let gid = rnd(1, 5);
        for (let r = 1; r <= profile.rounds; r++) {
            historyRows.push({
                group_id: gid,
                wallet_address: address,
                discount_amount: rnd(
                    Math.floor(profile.avgBid * 0.7),
                    Math.floor(profile.avgBid * 1.3)
                ),
                did_win: r <= profile.wins,
                round_number: r,
                completed_at: daysAgo(profile.rounds - r + 1),
            });
            if (r % 5 === 0) gid = rnd(1, 10);
        }
    }

    const BATCH = 100;
    for (let i = 0; i < historyRows.length; i += BATCH) {
        await supabasePost("bid_history", historyRows.slice(i, i + BATCH));
        console.log(`  ✓ rows ${i + 1}–${Math.min(i + BATCH, historyRows.length)}`);
    }
    console.log(`\n✅ Inserted ${historyRows.length} bid history rows`);

    // ── Summary ───────────────────────────────────────────────────────────────
    console.log("\n" + "═".repeat(72));
    console.log("  SEED COMPLETE");
    console.log("═".repeat(72));
    console.log("  Address                                       Score  Tier");
    console.log("  " + "─".repeat(68));
    for (const { address, profile } of wallets) {
        const tier = profile.label.split("—")[1]?.trim() ?? "";
        console.log(`  ${address}  ${String(profile.score).padStart(4)}   ${tier}`);
    }
    console.log();
})();
