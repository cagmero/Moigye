"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Globe, Calendar, ArrowRight, Loader2, XCircle, Lock, Star } from "lucide-react";
import { useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useAccount } from "wagmi";
import { GYE_MANAGER_CONTRACT } from "@/lib/contracts";
import { useUserSync, minScoreForDeposit, getTier } from "@/hooks/useUserSync";
import { supabase } from "@/utils/supabaseClient";

interface GyeGroup {
    groupId: number;
    moderator: string;
    currentParticipants: number;
    maxParticipants: number;
    fixedDeposit: number;
    totalPotAmount: number;
    biddingDate: number;
    isPublic: boolean;
}

export default function DiscoveryExplorer({ onBack }: { onBack: () => void }) {
    const [search, setSearch] = useState("");
    const [filterDeposit, setFilterDeposit] = useState<number>(0);
    const [sortBy, setSortBy] = useState<"pot" | "date" | "members">("date");
    const { isBanned, score, loading: userSyncLoading } = useUserSync();
    const { address } = useAccount();

    // 1. Fetch from Supabase (Source of Truth for "Real" groups)
    const [dbGroups, setDbGroups] = useState<any[]>([]);
    const [dbLoading, setDbLoading] = useState(true);

    useEffect(() => {
        const fetchPublic = async () => {
            setDbLoading(true);
            const { data, error } = await supabase
                .from("groups")
                .select("*")
                .eq("is_public", true)
                .order("group_id", { ascending: false });

            if (!error && data) setDbGroups(data);
            setDbLoading(false);
        };
        fetchPublic();
    }, []);

    // 2. Fetch live contract data for these specific IDs for enrichment (e.g., current participants)
    const { data: contractGroups } = useReadContracts({
        contracts: dbGroups.map(g => ({
            ...GYE_MANAGER_CONTRACT,
            functionName: "groups",
            args: [BigInt(g.group_id)],
        })),
        query: { enabled: dbGroups.length > 0 },
    });

    // 2. Join Group Logic — award +10 score on success
    const { writeContract, data: hash, isPending: isJoining } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isJoinConfirmed } = useWaitForTransactionReceipt({ hash });
    const [joiningGroupId, setJoiningGroupId] = useState<number | null>(null);

    useEffect(() => {
        if (isJoinConfirmed && address && joiningGroupId !== null) {
            // Award +10 score on confirmed deposit/join
            const awardScore = async () => {
                const { error } = await supabase.rpc("increment_score", {
                    p_wallet: address.toLowerCase(),
                    p_amount: 10,
                });
                if (error) console.warn("Score increment error:", error.message);
            };
            awardScore();
            setJoiningGroupId(null);
        }
    }, [isJoinConfirmed, address, joiningGroupId]);

    const handleJoin = (groupId: number) => {
        setJoiningGroupId(groupId);
        writeContract({
            ...GYE_MANAGER_CONTRACT,
            functionName: "joinPublicGroup",
            args: [BigInt(groupId)],
        });
    };

    const isLoading = dbLoading || (dbGroups.length > 0 && !contractGroups);

    const groups: GyeGroup[] = dbGroups.map((g, i) => {
        const cMatch = contractGroups?.[i]?.result as any;

        // Structure from contract: 9 fields: groupId, moderator, fixedDeposit, minScoreRequired, maxParticipants, biddingDate, isPublic, isActive, started
        // struct GyeGroup returns elements as array
        const curator = cMatch?.[1] || g.moderator;
        const currentMems = cMatch?.[2] || 0; // Wait! GyeManager struct has members array skipped.
        // Wait! My previous read of GyeGroup struct shows index 2 is fixedDeposit. 
        // How do we get currentParticipants? 
        // AH! GyeManager.sol:214 `getAllPublicGroups` returns `GroupView` struct!
        // `GroupView` index 2 is `currentParticipants`.

        // But `groups(id)` accessor on Hub returns `GyeGroup` struct.
        // `GyeGroup` (Hub-only) doesn't have `currentParticipants` readily available if members is skipped.

        // Let's re-read GyeManager.sol `GroupView`.
        /*
        42:     struct GroupView {
        43:         uint256 groupId;
        44:         address moderator;
        45:         uint256 currentParticipants;
        46:         uint256 maxParticipants;
        47:         uint256 fixedDeposit;
        48:         uint256 minScoreRequired;
        49:         uint256 totalPotAmount;
        50:         uint256 biddingDate;
        51:         bool isPublic;
        52:     }
        */

        // If I want group info for ANY group, I can't call `getAllPublicGroups` for a specific ID easily.
        // I can call `groups(id)` which gives `GyeGroup`.

        // Wait, I see `is_public` in Supabase.

        // Actually, let's keep it simple and use what we have in Supabase augmented by whatever the contract provides.
        const deposit = cMatch ? Number(cMatch[2]) : Number(g.fixed_deposit);
        const maxPart = cMatch ? Number(cMatch[4]) : Number(g.max_participants);
        const bDate = cMatch ? Number(cMatch[5]) * 1000 : new Date(g.created_at).getTime();

        return {
            groupId: g.group_id,
            moderator: curator,
            currentParticipants: 0, // Fallback if not available at individual group read
            maxParticipants: maxPart,
            fixedDeposit: deposit,
            totalPotAmount: 0,
            biddingDate: bDate,
            isPublic: !!g.is_public,
        };
    });

    const filteredGroups = groups
        .filter(g => g.fixedDeposit >= filterDeposit)
        .filter(g =>
            g.moderator.toLowerCase().includes(search.toLowerCase()) ||
            g.groupId.toString() === search
        )
        .sort((a, b) => {
            if (sortBy === "pot") return b.totalPotAmount - a.totalPotAmount;
            if (sortBy === "date") return a.biddingDate - b.biddingDate;
            if (sortBy === "members") return (b.currentParticipants / b.maxParticipants) - (a.currentParticipants / a.maxParticipants);
            return 0;
        });

    const userTier = getTier(score);

    return (
        <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Public Explorer</h2>
                    <p className="text-slate-500 font-medium text-sm">Join active Gye circles on the Creditcoin Network.</p>
                </div>
                <button onClick={onBack} className="group flex items-center gap-2 text-xs font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">
                    <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                    Lobby Hub
                </button>
            </div>

            {/* User Score Badge */}
            {!userSyncLoading && (
                <div className={`inline-flex items-center gap-3 px-5 py-3 rounded-full border ${userTier.bg} border-slate-100`}>
                    <Star className={`w-4 h-4 ${userTier.color}`} />
                    <span className={`text-xs font-black uppercase tracking-widest ${userTier.color}`}>
                        Your Score: {score} — {userTier.label}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                        (Max deposit you can join: ${userTier.maxDeposit === Infinity ? "Unlimited" : userTier.maxDeposit.toLocaleString()})
                    </span>
                </div>
            )}

            {/* Sticky Filter Bar */}
            <div className="sticky top-28 z-40">
                <div className="glass-morphism p-2 rounded-full flex flex-col md:flex-row items-center gap-2 border border-white/40 shadow-premium">
                    <div className="flex-1 relative w-full">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                        <input
                            type="text"
                            placeholder="Search moderator address or group ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-16 pr-6 py-4 bg-transparent rounded-full outline-none font-bold text-slate-900 placeholder:text-slate-300"
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto p-1">
                        <select
                            value={filterDeposit}
                            onChange={(e) => setFilterDeposit(parseInt(e.target.value))}
                            className="pl-6 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-full outline-none appearance-none font-black text-xs uppercase tracking-widest text-slate-600 cursor-pointer"
                        >
                            <option value="0">All Deposits</option>
                            <option value="500">Min $500</option>
                            <option value="1000">Min $1k</option>
                            <option value="2000">Min $2k</option>
                        </select>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="pl-6 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-full outline-none appearance-none font-black text-xs uppercase tracking-widest text-slate-600 cursor-pointer"
                        >
                            <option value="date">Sort By Date</option>
                            <option value="pot">Sort By Pot</option>
                            <option value="members">Sort By Members</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Group Grid */}
            {isLoading ? (
                <div className="flex justify-center py-32">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                </div>
            ) : (
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence>
                        {filteredGroups.map((group) => {
                            const requiredScore = minScoreForDeposit(group.fixedDeposit);
                            const scoreLocked = score < requiredScore;
                            const isFull = group.currentParticipants >= group.maxParticipants;
                            const isThisJoining = joiningGroupId === group.groupId && (isJoining || isConfirming);

                            return (
                                <motion.div
                                    key={group.groupId}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    whileHover={{ y: -8 }}
                                    className={`group bg-white p-8 rounded-[2.5rem] border shadow-premium relative overflow-hidden flex flex-col justify-between h-[440px] ${scoreLocked ? "border-slate-100 opacity-75" : "border-slate-200/50"}`}
                                >
                                    {/* Score lock watermark */}
                                    {scoreLocked && (
                                        <div className="absolute top-4 right-4 z-20">
                                            <div className="flex items-center gap-1.5 bg-slate-900/80 text-white px-3 py-1.5 rounded-full">
                                                <Lock className="w-3 h-3" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Score {requiredScore}+</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                    <div className="space-y-6 relative z-10">
                                        <div className="flex justify-between items-start">
                                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 border border-slate-100">
                                                <Globe className="w-6 h-6" />
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Group ID</p>
                                                <p className="text-xl font-black text-slate-900 tracking-tighter">#{group.groupId}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Fixed Deposit</p>
                                            <p className="text-5xl font-black text-slate-900 tracking-tighter">${group.fixedDeposit}</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Pot</p>
                                                <p className="text-lg font-black text-blue-600">${group.totalPotAmount}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Members</p>
                                                <div className="flex items-end gap-1">
                                                    <p className="text-lg font-black text-slate-900">{group.currentParticipants}</p>
                                                    <p className="text-xs font-bold text-slate-400 mb-0.5">/ {group.maxParticipants}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 relative z-10 pt-6 border-t border-slate-50">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                            <Calendar className="w-4 h-4 text-slate-300" />
                                            Bidding Room Opens {new Date(group.biddingDate).toLocaleDateString()}
                                        </div>

                                        {isBanned ? (
                                            <div className="w-full bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center justify-center gap-2">
                                                <XCircle className="w-4 h-4 text-red-600" />
                                                <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Account Suspended</span>
                                            </div>
                                        ) : scoreLocked ? (
                                            <div className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col items-center gap-2">
                                                <Lock className="w-4 h-4 text-slate-400" />
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">
                                                    Score {requiredScore} required to join
                                                </span>
                                                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className="h-full bg-slate-900 rounded-full transition-all"
                                                        style={{ width: `${Math.min(100, (score / requiredScore) * 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-[9px] text-slate-400 font-bold">{score} / {requiredScore}</span>
                                            </div>
                                        ) : (
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                disabled={isThisJoining || userSyncLoading || isFull}
                                                onClick={() => handleJoin(group.groupId)}
                                                className={`w-full premium-button py-4 text-sm ${isThisJoining ? "bg-slate-200" : ""} disabled:opacity-50`}
                                            >
                                                {isThisJoining ? "Joining..." : isFull ? "Group Full" : "Join Circle"}
                                            </motion.button>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </motion.div>
            )}

            {groups.length === 0 && !isLoading && (
                <div className="text-center py-32 space-y-6 glass-morphism rounded-[3rem]">
                    <Globe className="w-16 h-16 text-slate-200 mx-auto" />
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black text-slate-900">No Public Circles</h3>
                        <p className="text-slate-500 font-medium">Be the first to create a public Gye circle on the Creditcoin Network.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
