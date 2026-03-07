"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { supabase } from "@/utils/supabaseClient";

export function useUserSync() {
    const { user, authenticated, ready } = usePrivy();
    const [isBanned, setIsBanned] = useState<boolean>(false);
    const [score, setScore] = useState<number>(300);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (!ready || !authenticated || !user) {
            setLoading(false);
            return;
        }

        const syncUser = async () => {
            const privyDid = user.id;
            const walletAddress = user.wallet?.address?.toLowerCase();
            if (!walletAddress) { setLoading(false); return; }

            // Step 1: Try to fetch the existing user first (to not overwrite score)
            const { data: existing } = await supabase
                .from("users")
                .select("is_banned, score")
                .eq("wallet_address", walletAddress)
                .maybeSingle();

            if (existing) {
                // User already exists — just read their data
                setIsBanned(existing.is_banned);
                setScore(existing.score);
            } else {
                // Brand new user — insert with 300 base score
                const { data: newUser, error } = await supabase
                    .from("users")
                    .insert({
                        wallet_address: walletAddress,
                        privy_did: privyDid,
                        score: 300,
                        is_banned: false,
                    })
                    .select("is_banned, score")
                    .single();

                if (error) {
                    console.warn("User sync error:", error.message);
                } else if (newUser) {
                    setIsBanned(newUser.is_banned);
                    setScore(newUser.score);
                }
            }
            setLoading(false);
        };

        syncUser();
    }, [ready, authenticated, user]);

    return { isBanned, score, loading };
}

// ── Score utility helpers ───────────────────────────────────────

export const SCORE_TIERS = [
    { label: "Tier 1 — Newcomer", min: 0, max: 399, maxDeposit: 500, color: "text-slate-500", bg: "bg-slate-50" },
    { label: "Tier 2 — Active Member", min: 400, max: 599, maxDeposit: 2000, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Tier 3 — Circle Elder", min: 600, max: 799, maxDeposit: 10000, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Tier 4 — Protocol Guardian", min: 800, max: 999, maxDeposit: Infinity, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Tier 5 — Protocol Legend", min: 1000, max: Infinity, maxDeposit: Infinity, color: "text-amber-500", bg: "bg-amber-50" },
] as const;

/** Returns the tier object for a given score */
export function getTier(score: number) {
    return SCORE_TIERS.find(t => score >= t.min && score <= t.max) ?? SCORE_TIERS[0];
}

/** Returns the minimum score required to join a circle based on its fixed deposit */
export function minScoreForDeposit(fixedDeposit: number): number {
    if (fixedDeposit <= 500) return 300;
    if (fixedDeposit <= 2000) return 400;
    if (fixedDeposit <= 10000) return 600;
    return 800; // Whale circles
}

/** Increment a user's score by a given amount */
export async function addScore(walletAddress: string, amount: number) {
    await supabase.rpc("increment_score", {
        p_wallet: walletAddress.toLowerCase(),
        p_amount: amount,
    });
}
