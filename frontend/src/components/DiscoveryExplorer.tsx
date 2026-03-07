"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, ArrowUpDown, DollarSign, Users, Calendar, ArrowRight, Globe, Loader2, XCircle } from "lucide-react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { GYE_MANAGER_CONTRACT } from "@/lib/contracts";
import { useUserSync } from "@/hooks/useUserSync";

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
    const { isBanned, loading: userSyncLoading } = useUserSync();

    // 1. Fetch Public Groups from Contract
    const { data: rawGroups, isLoading, refetch } = useReadContract({
        ...GYE_MANAGER_CONTRACT,
        functionName: "getAllPublicGroups",
    });

    // 2. Join Group Logic
    const { writeContract, data: hash, isPending: isJoining } = useWriteContract();
    const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

    const handleJoin = (groupId: number) => {
        writeContract({
            ...GYE_MANAGER_CONTRACT,
            functionName: "joinPublicGroup",
            args: [BigInt(groupId)],
        });
    };

    const groups: GyeGroup[] = (rawGroups as any[])?.map((g: any) => ({
        groupId: Number(g.groupId),
        moderator: g.moderator,
        currentParticipants: Number(g.currentParticipants),
        maxParticipants: Number(g.maxParticipants),
        fixedDeposit: Number(g.fixedDeposit),
        totalPotAmount: Number(g.totalPotAmount),
        biddingDate: Number(g.biddingDate) * 1000,
        isPublic: g.isPublic,
    })) || [];

    const filteredGroups = groups
        .filter(g => g.fixedDeposit >= filterDeposit)
        .filter(g => g.moderator.toLowerCase().includes(search.toLowerCase()) || g.groupId.toString() === search)
        .sort((a, b) => {
            if (sortBy === "pot") return b.totalPotAmount - a.totalPotAmount;
            if (sortBy === "date") return a.biddingDate - b.biddingDate;
            if (sortBy === "members") return (b.currentParticipants / b.maxParticipants) - (a.currentParticipants / a.maxParticipants);
            return 0;
        });

    return (
        <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Public Explorer</h2>
                    <p className="text-slate-500 font-medium text-sm">Join active Gye circles on the Creditcoin Network.</p>
                </div>
                <button
                    onClick={onBack}
                    className="group flex items-center gap-2 text-xs font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors"
                >
                    <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                    Lobby Hub
                </button>
            </div>

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
                            className="pl-6 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-full outline-none focus:border-slate-300 transition-all appearance-none font-black text-xs uppercase tracking-widest text-slate-600 cursor-pointer"
                        >
                            <option value="0">All Deposits</option>
                            <option value="500">Min $500</option>
                            <option value="1000">Min $1k</option>
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="pl-6 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-full outline-none focus:border-slate-300 transition-all appearance-none font-black text-xs uppercase tracking-widest text-slate-600 cursor-pointer"
                        >
                            <option value="date">Sort By Date</option>
                            <option value="pot">Sort By Pot</option>
                            <option value="members">Sort By Members</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="flex justify-center py-32">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                </div>
            ) : (
                <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    <AnimatePresence>
                        {filteredGroups.map((group) => (
                            <motion.div
                                key={group.groupId}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                whileHover={{ y: -8 }}
                                className="group bg-white p-8 rounded-[2.5rem] border border-slate-200/50 shadow-premium relative overflow-hidden flex flex-col justify-between h-[420px]"
                            >
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

                                <div className="space-y-6 relative z-10 pt-8 border-t border-slate-50">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                        <Calendar className="w-4 h-4 text-slate-300" />
                                        Bidding Room Opens {new Date(group.biddingDate).toLocaleDateString()}
                                    </div>
                                    {isBanned ? (
                                        <div className="w-full bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center justify-center gap-2 group-hover:bg-red-100 transition-colors shadow-sm">
                                            <XCircle className="w-4 h-4 text-red-600" />
                                            <span className="text-[10px] font-black text-red-600 uppercase tracking-widest text-center">
                                                Account Suspended: Default Detected
                                            </span>
                                        </div>
                                    ) : (
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            disabled={isJoining || isConfirming || userSyncLoading || group.currentParticipants >= group.maxParticipants}
                                            onClick={() => handleJoin(group.groupId)}
                                            className={`w-full premium-button py-4 text-sm ${isJoining || isConfirming ? 'bg-slate-200' : ''}`}
                                        >
                                            {isJoining ? "Joining..." : isConfirming ? "Confirming..." : group.currentParticipants >= group.maxParticipants ? "Group Full" : "Join Circle"}
                                        </motion.button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
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
