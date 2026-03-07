// scripts/seed-dummy-wallets.mjs
// Uses ONLY Node.js built-ins (crypto) + native fetch
// No SDK imports that trigger async init crashes on Windows Node v24
// Run: node scripts/seed-dummy-wallets.mjs

import crypto from "node:crypto";

// ── Supabase REST config ──────────────────────────────────────────────────────
const SUPABASE_URL = "https://rfzopdbbwujrohkxenmt.supabase.co";
const SUPABASE_KEY = "sb_publishable_bLrk1KD7_JxCiwW2kB4XbA_lyqgxO9l";

const BASE_HEADERS = {
    "Content-Type": "application/json",
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
};

async function rest(table, rows, upsertColumn = null) {
    const url = `${SUPABASE_URL}/rest/v1/${table}`;
    const prefer = upsertColumn
        ? "resolution=merge-duplicates,return=representation"
        : "return=representation";
    const params = upsertColumn ? `?on_conflict=${upsertColumn}` : "";

    const res = await fetch(url + params, {
        method: "POST",
        headers: { ...BASE_HEADERS, Prefer: prefer },
        body: JSON.stringify(rows),
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`[${res.status}] POST /${table}: ${text}`);
    return JSON.parse(text);
}

// ── Wallet generation using Node crypto (no external deps) ────────────────────
// Generates a valid 160-bit Ethereum address from random bytes.
// (We don't need real secp256k1 keypairs — just unique, valid-format addresses.)
function generateWallet(index) {
    const bytes = crypto.randomBytes(20);
    const address = "0x" + bytes.toString("hex");
    return address;
}

// ── Dummy wallet definitions ─────────────────────────────────────────────────
const DUMMY_PROFILES = [
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

// ── Main ──────────────────────────────────────────────────────────────────────
const wallets = DUMMY_PROFILES.map((profile, i) => ({
    address: generateWallet(i),
    profile,
}));

console.log("🔑 Generated dummy wallet addresses:\n");
wallets.forEach(({ address, profile }, i) => {
    console.log(`  [${i + 1}] ${profile.label}`);
    console.log(`      ${address}  (score: ${profile.score})\n`);
});

// ── Upsert users ──────────────────────────────────────────────────────────────
console.log("📝 Upserting to users table...");
const userRows = wallets.map(({ address, profile }, i) => ({
    wallet_address: address,
    privy_did: `dummy_${i + 1}`,
    score: profile.score,
    is_banned: false,
}));

const inserted = await rest("users", userRows, "wallet_address");
console.log(`✅ Upserted ${inserted.length} users\n`);

// ── Seed bid_history ──────────────────────────────────────────────────────────
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

// Batch insert (100 rows at a time)
const BATCH = 100;
for (let i = 0; i < historyRows.length; i += BATCH) {
    await rest("bid_history", historyRows.slice(i, i + BATCH));
    process.stdout.write(`  ✓ rows ${i + 1}–${Math.min(i + BATCH, historyRows.length)}\n`);
}

console.log(`\n✅ Inserted ${historyRows.length} bid history rows`);

// ── Summary ───────────────────────────────────────────────────────────────────
console.log("\n" + "═".repeat(72));
console.log("  SEED COMPLETE — wallet data is live in Supabase");
console.log("═".repeat(72));
console.log("  Address                                       Score  Tier");
console.log("  " + "─".repeat(68));
for (const { address, profile } of wallets) {
    const tier = profile.label.split("—")[1]?.trim() ?? "";
    console.log(`  ${address}  ${String(profile.score).padStart(4)}   ${tier}`);
}
