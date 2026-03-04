"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, ArrowUpDown, DollarSign, Users, Calendar, ArrowRight, Globe } from "lucide-react";

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
    const [groups] = useState<GyeGroup[]>([
        { groupId: 1, moderator: "0x123...456", currentParticipants: 3, maxParticipants: 10, fixedDeposit: 500, totalPotAmount: 1500, biddingDate: Date.now() + 86400000, isPublic: true },
        { groupId: 2, moderator: "0x789...012", currentParticipants: 8, maxParticipants: 20, fixedDeposit: 100, totalPotAmount: 800, biddingDate: Date.now() + 172800000, isPublic: true },
        { groupId: 3, moderator: "0xabc...def", currentParticipants: 5, maxParticipants: 5, fixedDeposit: 1000, totalPotAmount: 5000, biddingDate: Date.now() + 43200000, isPublic: true },
        { groupId: 4, moderator: "0xdef...789", currentParticipants: 1, maxParticipants: 5, fixedDeposit: 250, totalPotAmount: 250, biddingDate: Date.now() + 259200000, isPublic: true },
    ]);

    const [filterDeposit, setFilterDeposit] = useState<number>(0);
    const [sortBy, setSortBy] = useState<"pot" | "date" | "members">("date");
    const [search, setSearch] = useState("");

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
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Public Explorer</h2>
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
                <div className="glass-morphism p-2 rounded-full flex flex-col md:flex-row items-center gap-2">
                    <div className="flex-1 relative w-full">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                        <input
                            type="text"
                            placeholder="Search moderator address..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-16 pr-6 py-4 bg-transparent rounded-full outline-none font-bold text-slate-900 placeholder:text-slate-300"
                        />
                    </div>

                    <div className="flex gap-2 w-full md:w-auto p-1">
                        <div className="relative">
                            <select
                                value={filterDeposit}
                                onChange={(e) => setFilterDeposit(parseInt(e.target.value))}
                                className="pl-6 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-full outline-none focus:border-slate-300 transition-all appearance-none font-black text-xs uppercase tracking-widest text-slate-600 cursor-pointer"
                            >
                                <option value="0">All Deposits</option>
                                <option value="500">Min $500</option>
                                <option value="1000">Min $1k</option>
                            </select>
                        </div>

                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="pl-6 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-full outline-none focus:border-slate-300 transition-all appearance-none font-black text-xs uppercase tracking-widest text-slate-600 cursor-pointer"
                            >
                                <option value="date">Sort By Date</option>
                                <option value="pot">Sort By Pot</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
                <AnimatePresence>
                    {filteredGroups.map((group) => (
                        <motion.div
                            key={group.groupId}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            whileHover={{ y: -8 }}
                            className="group bg-white p-8 rounded-[2.5rem] border border-slate-200/50 shadow-premium relative overflow-hidden flex flex-col justify-between h-[420px]"
                        >
                            {/* Mesh Accent */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-50 to-pink-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

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
                                        <p className="text-lg font-black text-indigo-600">${group.totalPotAmount}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Fill Rate</p>
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
                                    Starts {new Date(group.biddingDate).toLocaleDateString()}
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full premium-button py-4 text-sm"
                                >
                                    Request Entry
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
