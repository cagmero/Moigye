"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, ArrowUpDown, DollarSign, Users, Calendar, ArrowRight, Tag } from "lucide-react";

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
    const [groups, setGroups] = useState<GyeGroup[]>([
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
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Search & Filter Bar */}
            <div className="glass-card p-6 flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1 relative w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by Group ID or Moderator..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:border-blue-900 transition-all font-medium"
                    />
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-48">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                            value={filterDeposit}
                            onChange={(e) => setFilterDeposit(parseInt(e.target.value))}
                            className="w-full pl-10 pr-4 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:border-blue-900 transition-all appearance-none font-bold text-sm text-slate-600"
                        >
                            <option value="0">All Deposits</option>
                            <option value="100">$100+</option>
                            <option value="500">$500+</option>
                            <option value="1000">$1000+</option>
                        </select>
                    </div>

                    <div className="relative flex-1 md:w-48">
                        <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="w-full pl-10 pr-4 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:border-blue-900 transition-all appearance-none font-bold text-sm text-slate-600"
                        >
                            <option value="date">Bidding Date</option>
                            <option value="pot">Total Pot Size</option>
                            <option value="members">Fill Rate</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGroups.map((group) => (
                    <div key={group.groupId} className="group glass-card p-6 space-y-6 hover:shadow-xl transition-all border-b-4 border-b-transparent hover:border-b-blue-900/10">
                        <div className="flex justify-between items-start">
                            <div className="bg-blue-50 text-blue-900 px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase">
                                Group #{group.groupId}
                            </div>
                            {group.currentParticipants === group.maxParticipants ? (
                                <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">Full</span>
                            ) : (
                                <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                    Available
                                </span>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-end gap-1">
                                <span className="text-3xl font-black text-slate-900">${group.fixedDeposit}</span>
                                <span className="text-sm font-bold text-slate-400 mb-1.5 uppercase tracking-tighter">Fixed Deposit</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Participants</p>
                                    <p className="text-sm font-bold text-slate-900">{group.currentParticipants}/{group.maxParticipants}</p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Pot</p>
                                    <p className="text-sm font-bold text-blue-900">${group.totalPotAmount}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                <Calendar className="w-3.5 h-3.5" />
                                Bidding starts {new Date(group.biddingDate).toLocaleDateString()}
                            </div>
                        </div>

                        <button
                            disabled={group.currentParticipants === group.maxParticipants}
                            className="w-full premium-button py-4 font-black flex items-center justify-center gap-2 group-hover:gap-3 transition-all disabled:opacity-50 disabled:grayscale"
                        >
                            Quick Join <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            <button onClick={onBack} className="text-slate-400 hover:text-slate-900 font-bold flex items-center gap-2 pt-8">
                <ArrowRight className="w-4 h-4 rotate-180" /> Back to Lobby Hub
            </button>
        </div>
    );
}
