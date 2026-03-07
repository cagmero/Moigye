"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, TrendingUp, Zap, History, LayoutGrid, ArrowUpRight, CheckCircle2, Coins, Loader2, Gavel } from "lucide-react";
import { useAccount } from "wagmi";
import { supabase } from "@/utils/supabaseClient";

interface BidRecord {
    id: number;
    group_id: number;
    discount_amount: number;
    did_win: boolean;
    round_number: number;
    completed_at: string;
}

export default function ReputationPage() {
    const { address } = useAccount();
    const [history, setHistory] = useState<BidRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!address) { setLoading(false); return; }
        const fetch = async () => {
            const { data, error } = await supabase
                .from("bid_history")
                .select("*")
                .eq("wallet_address", address.toLowerCase())
                .order("completed_at", { ascending: false });
            if (!error) setHistory(data || []);
            setLoading(false);
        };
        fetch();
    }, [address]);

    const totalWins = history.filter(h => h.did_win).length;
    const totalRounds = history.length;
    const totalVolume = history.reduce((s, h) => s + Number(h.discount_amount), 0);
    // Score: 0–1000 scale: 100 base + 50 per win + 10 per round, max 1000
    const score = Math.min(1000, 100 + totalWins * 50 + totalRounds * 10);
    const winRate = totalRounds > 0 ? Math.round((totalWins / totalRounds) * 100) : 0;

    const circleLength = 251.2;
    const progress = (score / 1000) * circleLength;

    const tier =
        score >= 900 ? "Tier 5: Protocol Legend" :
            score >= 700 ? "Tier 4: Protocol Guardian" :
                score >= 500 ? "Tier 3: Circle Elder" :
                    score >= 300 ? "Tier 2: Active Member" :
                        "Tier 1: New Member";

    const tierDesc =
        score >= 700
            ? `Your consistent deposits and non-default history place you in the top protocol tier.`
            : score >= 300
                ? `Keep participating in rounds to grow your score and unlock higher protocol limits.`
                : `Join your first Gye circle and place bids to start building your on-chain reputation.`;

    if (!address) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-32 text-center space-y-6">
                <Shield className="w-16 h-16 text-slate-200 mx-auto" />
                <h2 className="text-3xl font-black text-slate-900">Connect Wallet</h2>
                <p className="text-slate-500 font-medium">Connect your wallet to view your on-chain reputation.</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-end justify-between">
                <div className="space-y-4">
                    <h1 className="text-6xl font-black text-slate-900 tracking-tighter">Your Reputation.</h1>
                    <p className="text-xl text-slate-500 font-medium">On-chain credit and protocol statistics.</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-32">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Credit Score Dial */}
                        <div className="lg:col-span-5 glass-morphism rounded-[3rem] p-12 flex flex-col items-center justify-center space-y-10 relative overflow-hidden bg-white">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-50 to-pink-50 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2" />
                            <div className="relative">
                                <svg viewBox="0 0 100 100" className="w-64 h-64 transform -rotate-90">
                                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="8" />
                                    <motion.circle
                                        cx="50" cy="50" r="40"
                                        fill="transparent"
                                        stroke="url(#scoreGradient)"
                                        strokeWidth="8"
                                        strokeDasharray={circleLength}
                                        initial={{ strokeDashoffset: circleLength }}
                                        animate={{ strokeDashoffset: circleLength - progress }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        strokeLinecap="round"
                                    />
                                    <defs>
                                        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#1e3a8a" />
                                            <stop offset="100%" stopColor="#6366f1" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">On-Chain Score</p>
                                    <motion.p
                                        className="text-7xl font-black text-slate-900 tracking-tighter"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        {score}
                                    </motion.p>
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${score >= 700 ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
                                        <ArrowUpRight className="w-3 h-3" />
                                        {score >= 700 ? "Excellent" : score >= 400 ? "Good" : "Building"}
                                    </div>
                                </div>
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight italic">{tier}</h3>
                                <p className="text-sm text-slate-500 font-medium px-8 leading-relaxed">{tierDesc}</p>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[
                                { label: "Total Bid Volume", val: totalVolume > 0 ? `$${totalVolume.toLocaleString()}` : "—", icon: <Coins className="w-6 h-6" />, color: "bg-blue-50 text-blue-900" },
                                { label: "Rounds Won", val: totalWins > 0 ? `${totalWins} Won` : "None yet", icon: <CheckCircle2 className="w-6 h-6" />, color: "bg-emerald-50 text-emerald-600" },
                                { label: "Win Rate", val: totalRounds > 0 ? `${winRate}%` : "—", icon: <TrendingUp className="w-6 h-6" />, color: "bg-indigo-50 text-indigo-900" },
                                { label: "Rounds Played", val: totalRounds > 0 ? `${totalRounds} Total` : "None yet", icon: <Zap className="w-6 h-6" />, color: "bg-orange-50 text-orange-600" },
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ y: -4 }}
                                    className="glass-morphism rounded-[2.5rem] p-8 flex flex-col justify-between space-y-6 bg-white border border-slate-100/50"
                                >
                                    <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center shadow-sm`}>
                                        {stat.icon}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                                        <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.val}</p>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Staking CTA */}
                            <div className="md:col-span-2 group relative h-48 rounded-[2.5rem] overflow-hidden shadow-premium cursor-pointer transition-transform hover:scale-[1.01] active:scale-[0.99] border border-slate-200/50">
                                <div className="absolute inset-0 bg-slate-900 z-0" />
                                <div className="absolute inset-0 mesh-gradient opacity-10 z-1" />
                                <div className="relative z-10 h-full p-8 flex items-center justify-between text-white">
                                    <div className="space-y-2">
                                        <h3 className="text-3xl font-black tracking-tight">Boost Your Credit Score.</h3>
                                        <p className="text-sm opacity-60 font-medium">Win more rounds to climb tiers and unlock higher bidding limits.</p>
                                    </div>
                                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-white group-hover:text-slate-900 transition-all duration-300">
                                        <ArrowUpRight className="w-8 h-8" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity from real bid_history */}
                    <div className="space-y-8 pt-8">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            <History className="w-8 h-8 text-slate-400" />
                            Recent Activity
                        </h2>

                        <div className="glass-morphism rounded-[3rem] overflow-hidden bg-white border border-slate-100/50">
                            <div className="p-4 space-y-1">
                                {history.length === 0 ? (
                                    <div className="py-16 text-center space-y-4">
                                        <Gavel className="w-10 h-10 text-slate-200 mx-auto" />
                                        <p className="text-slate-400 font-bold text-sm">No activity yet. Join a circle and place your first bid.</p>
                                    </div>
                                ) : (
                                    history.slice(0, 10).map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-6 rounded-2xl hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                                            <div className="flex items-center gap-6">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.did_win ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                                                    {item.did_win ? <CheckCircle2 className="w-6 h-6" /> : <LayoutGrid className="w-6 h-6" />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">
                                                        {item.did_win ? "Won" : "Participated in"} Circle #{item.group_id} — Round {item.round_number}
                                                    </p>
                                                    <p className="text-xs text-slate-400 font-medium tracking-tight">
                                                        {new Date(item.completed_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-slate-900">${Number(item.discount_amount).toLocaleString()}</p>
                                                <p className={`text-[10px] font-black uppercase tracking-widest ${item.did_win ? "text-emerald-500" : "text-slate-400"}`}>
                                                    {item.did_win ? "Round Winner ✓" : "Participated"}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
