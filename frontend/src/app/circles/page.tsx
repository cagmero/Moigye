"use client";

import React, { useEffect, useState } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { Users, ArrowRight, Compass, LayoutGrid, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { GYE_MANAGER_CONTRACT, BIDDING_ENGINE_CONTRACT } from "@/lib/contracts";
import { supabase } from "@/utils/supabaseClient";

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
};

interface Circle {
    id: string;
    moderator: string;
    fixedDeposit: number;
    maxParticipants: number;
    isPublic: boolean;
    phase?: number;
}

export default function CirclesPage() {
    const { address } = useAccount();
    const [dbCircles, setDbCircles] = useState<Circle[]>([]);
    const [dbLoading, setDbLoading] = useState(true);

    // 1. Fetch from Supabase (Stored Metadata)
    useEffect(() => {
        const fetchDb = async () => {
            setDbLoading(true);
            try {
                const { data, error } = await supabase
                    .from("groups")
                    .select("group_id, moderator, fixed_deposit, max_participants, is_public")
                    .order("group_id", { ascending: false });

                if (error) {
                    console.error("Supabase fetch error:", error);
                    setDbCircles([]);
                } else if (data && data.length > 0) {
                    console.log("Fetched from Supabase:", data);
                    setDbCircles(data.map(row => ({
                        id: String(row.group_id),
                        moderator: row.moderator || "",
                        fixedDeposit: Number(row.fixed_deposit) || 0,
                        maxParticipants: Number(row.max_participants) || 0,
                        isPublic: !!row.is_public
                    })));
                } else {
                    console.log("No groups found in Supabase");
                    setDbCircles([]);
                }
            } catch (err) {
                console.error("Error fetching from Supabase:", err);
                setDbCircles([]);
            }
            setDbLoading(false);
        };
        fetchDb();
    }, []);

    // 2. Get the current contract state
    const { data: nextGroupId } = useReadContract({
        ...GYE_MANAGER_CONTRACT,
        functionName: "nextGroupId",
    });

    // 2. Compute all unique IDs from Supabase
    const allIds = React.useMemo(() => {
        if (dbCircles.length === 0) return [];
        return dbCircles.map(c => BigInt(c.id))
            .sort((a, b) => (b > a ? 1 : -1));
    }, [dbCircles]);

    // 3. Fetch Contract Data for ALL discovered IDs
    const { data: groupsData, isLoading: fetchingGroups } = useReadContracts({
        contracts: allIds.map(id => ({
            ...GYE_MANAGER_CONTRACT,
            functionName: "groups",
            args: [id],
        })),
        query: { enabled: allIds.length > 0 },
    });

    const { data: phasesData } = useReadContracts({
        contracts: allIds.map(id => ({
            ...BIDDING_ENGINE_CONTRACT,
            functionName: "groups",
            args: [id],
        })),
        query: { enabled: allIds.length > 0 },
    });

    // WAIT for both sources to be consistent
    const loading = dbLoading || (allIds.length > 0 && fetchingGroups);

    // 4. Merge: Supabase (Primary) + Contract (Live Phase)
    const enrichedCircles = allIds
        .map((id, i) => {
            const idStr = id.toString();
            const dbMatch = dbCircles.find(c => c.id === idStr);
            
            if (!dbMatch) return null;

            const bResult = phasesData?.[i]?.result as any;
            const phase = bResult ? Number(bResult[5] || bResult.phase || 0) : 0;

            return {
                id: idStr,
                moderator: dbMatch.moderator,
                fixedDeposit: dbMatch.fixedDeposit,
                maxParticipants: dbMatch.maxParticipants,
                isPublic: dbMatch.isPublic,
                phase
            };
        })
        .filter((c) => c !== null && c.moderator !== "0x0000000000000000000000000000000000000000") as Circle[];

    const phaseNames = ["Idle", "Deposits", "Bidding", "Voting", "Final", "Done"];

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Users className="w-10 h-10 text-blue-600" />
                        All Circles
                    </h1>
                    <p className="text-slate-500 font-medium">All active savings pools on the protocol.</p>
                </div>
                <Link href="/lobby">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-black text-slate-900 shadow-sm hover:shadow-md transition-all"
                    >
                        <Compass className="w-5 h-5 text-blue-600" />
                        Discover Pools
                    </motion.button>
                </Link>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-32">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            ) : enrichedCircles.length > 0 ? (
                <motion.div
                    variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    <AnimatePresence mode="popLayout">
                        {enrichedCircles.map((circle) => {
                            const isMod = address?.toLowerCase() === circle.moderator.toLowerCase();
                            const isLive = circle.phase && circle.phase >= 1 && circle.phase <= 4;
                            return (
                                <motion.div
                                    key={circle.id}
                                    layout
                                    variants={itemVariants}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="bg-white p-8 rounded-[2.5rem] space-y-6 hover:-translate-y-2 transition-all cursor-pointer group border border-slate-200/60 shadow-premium relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className="relative z-10 flex justify-between items-start">
                                        <div className="p-4 bg-slate-900 rounded-2xl text-white">
                                            <LayoutGrid className="w-6 h-6" />
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isLive ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                                {isLive ? `Round: ${phaseNames[circle.phase || 0]}` : 'Waiting...'}
                                            </div>
                                            {isMod && (
                                                <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100">
                                                    Moderator
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Circle #{circle.id}</h3>
                                        <p className="text-xs font-mono text-slate-400 truncate">Mod: {circle.moderator}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100/50">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fixed Deposit</p>
                                            <p className="text-lg font-black text-slate-900">${circle.fixedDeposit.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Max Members</p>
                                            <p className="text-lg font-black text-slate-900">{circle.maxParticipants}</p>
                                        </div>
                                    </div>

                                    <Link href={`/circles/${circle.id}`} className="relative z-10 block">
                                        <div className="w-full py-4 bg-slate-50 group-hover:bg-slate-900 group-hover:text-white rounded-2xl font-black transition-all flex items-center justify-center gap-2">
                                            Enter Circle
                                            <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-32 space-y-6 glass-morphism rounded-[3rem]"
                >
                    <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto text-slate-300">
                        <Users className="w-10 h-10" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black text-slate-900">No Circles Yet</h3>
                        <p className="text-slate-500">Be the first to create a savings circle.</p>
                    </div>
                    <Link href="/lobby/create">
                        <button className="premium-button px-8 py-4">Create a Circle</button>
                    </Link>
                </motion.div>
            )}
        </div>
    );
}
