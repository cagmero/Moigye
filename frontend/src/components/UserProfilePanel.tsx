"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Gavel, TrendingUp, Calendar, ChevronDown, ChevronUp, User, Loader2 } from "lucide-react";
import { useAccount } from "wagmi";
import { supabase } from "@/utils/supabaseClient";
import { ArrowRight } from "lucide-react";

interface BidRecord {
    id: number;
    group_id: number;
    discount_amount: number;
    did_win: boolean;
    round_number: number;
    completed_at: string;
}

interface UserStats {
    totalRounds: number;
    totalWins: number;
    totalBidVolume: number;
    winRate: number;
}

export default function UserProfilePanel({ onBack }: { onBack: () => void }) {
    const { address } = useAccount();
    const [history, setHistory] = useState<BidRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedGroup, setExpandedGroup] = useState<number | null>(null);

    useEffect(() => {
        if (!address) { setLoading(false); return; }
        const fetchHistory = async () => {
            const { data, error } = await supabase
                .from("bid_history")
                .select("*")
                .eq("wallet_address", address.toLowerCase())
                .order("completed_at", { ascending: false });

            if (error) {
                // Tables may not exist yet — show empty state gracefully
                console.warn("Bid history fetch error:", error.message || error);
                setHistory([]);
            } else {
                setHistory(data || []);
            }
            setLoading(false);
        };
        fetchHistory();
    }, [address]);

    const stats: UserStats = {
        totalRounds: history.length,
        totalWins: history.filter(h => h.did_win).length,
        totalBidVolume: history.reduce((sum, h) => sum + Number(h.discount_amount), 0),
        winRate: history.length > 0 ? Math.round((history.filter(h => h.did_win).length / history.length) * 100) : 0,
    };

    // Group history by group_id
    const byGroup: Record<number, BidRecord[]> = {};
    history.forEach(h => {
        if (!byGroup[h.group_id]) byGroup[h.group_id] = [];
        byGroup[h.group_id].push(h);
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center py-40">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-6 py-10 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-slate-900 rounded-[1.5rem] text-white shadow-xl shadow-slate-900/20">
                        <User className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">My History</h2>
                        <p className="font-mono text-slate-400 text-sm font-medium">
                            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected"}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onBack}
                    className="group flex items-center gap-2 text-xs font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors"
                >
                    <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                    Back
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: "Rounds Played", value: stats.totalRounds, icon: <Gavel className="w-5 h-5" />, color: "text-blue-600" },
                    { label: "Rounds Won", value: stats.totalWins, icon: <Trophy className="w-5 h-5" />, color: "text-emerald-600" },
                    { label: "Win Rate", value: `${stats.winRate}%`, icon: <TrendingUp className="w-5 h-5" />, color: "text-indigo-600" },
                    { label: "Total Bid Volume", value: `$${stats.totalBidVolume.toLocaleString()}`, icon: <TrendingUp className="w-5 h-5" />, color: "text-slate-600" },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm space-y-3"
                    >
                        <div className={`${stat.color}`}>{stat.icon}</div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Per-Group History */}
            <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Round-by-Round Breakdown</h3>
                {Object.keys(byGroup).length === 0 ? (
                    <div className="glass-morphism rounded-[3rem] p-20 text-center space-y-4">
                        <Gavel className="w-12 h-12 text-slate-200 mx-auto" />
                        <p className="text-slate-400 font-bold">No bid history yet. Join a circle and place your first bid.</p>
                    </div>
                ) : (
                    Object.entries(byGroup).map(([groupId, rounds]) => {
                        const wins = rounds.filter(r => r.did_win).length;
                        const isExpanded = expandedGroup === Number(groupId);
                        return (
                            <div key={groupId} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                                <button
                                    onClick={() => setExpandedGroup(isExpanded ? null : Number(groupId))}
                                    className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-sm">
                                            #{groupId}
                                        </div>
                                        <div className="text-left">
                                            <p className="font-black text-slate-900">Circle #{groupId}</p>
                                            <p className="text-xs text-slate-400 font-medium">{rounds.length} rounds · {wins} won</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${wins > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-400'}`}>
                                            {wins > 0 ? `${wins} Win${wins > 1 ? 's' : ''}` : "No Wins"}
                                        </span>
                                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                    </div>
                                </button>

                                {isExpanded && (
                                    <div className="px-6 pb-6 space-y-3 border-t border-slate-50 pt-4">
                                        {rounds.map((round) => (
                                            <div key={round.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${round.did_win ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                                                        {round.did_win ? <Trophy className="w-4 h-4" /> : <Gavel className="w-4 h-4" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900">Round {round.round_number}</p>
                                                        <p className="text-xs text-slate-400 flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {new Date(round.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-black text-slate-900">${Number(round.discount_amount).toLocaleString()}</p>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${round.did_win ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                        {round.did_win ? "Winner ✓" : "Participated"}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
