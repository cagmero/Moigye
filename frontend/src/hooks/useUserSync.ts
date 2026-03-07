"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { supabase } from "@/utils/supabaseClient";

export function useUserSync() {
    const { user, authenticated, ready } = usePrivy();
    const [isBanned, setIsBanned] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (!ready || !authenticated || !user) {
            setLoading(false);
            return;
        }

        const syncUserAndCheckBan = async () => {
            const privyDid = user.id;
            const walletAddress = user.wallet?.address;

            if (!walletAddress) {
                setLoading(false);
                return;
            }

            // Upsert user to Supabase
            const { data, error } = await supabase
                .from('users')
                .upsert({
                    wallet_address: walletAddress.toLowerCase(),
                    privy_did: privyDid
                }, { onConflict: 'wallet_address' })
                .select('is_banned')
                .single();

            if (error) {
                console.error("Supabase sync error:", error);
            } else if (data) {
                setIsBanned(data.is_banned);
            }
            setLoading(false);
        };

        syncUserAndCheckBan();
    }, [ready, authenticated, user]);

    return { isBanned, loading };
}
