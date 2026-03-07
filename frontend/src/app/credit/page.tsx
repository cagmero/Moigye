"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, TrendingUp, Zap, History, LayoutGrid, ArrowUpRight, CheckCircle2, Coins } from "lucide-react";
import SpotlightCard from "@/components/SpotlightCard";
import SplitText from "@/components/SplitText";

export default function DashboardPage() {
    const [score, setScore] = useState(0);
    const targetScore = 782;

    useEffect(() => {
        const timer = setTimeout(() => {
            setScore(targetScore);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const circleLength = 251.2; // 2 * PI * 40
    const progress = (score / 1000) * circleLength;

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-end justify-between">
                <div className="space-y-4">
                    <h1 className="text-6xl font-black text-slate-900 tracking-tighter">
                        <SplitText
                            text="Your Reputation."
                            delay={30}
                            duration={0.8}
                        />
                    </h1>
                    <p className="text-xl text-slate-500 font-medium">On-chain credit and protocol statistics.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Credit Score Dial Card */}
                <div className="lg:col-span-5 glass-morphism rounded-[3rem] p-12 flex flex-col items-center justify-center space-y-10 relative overflow-hidden bg-white">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-50 to-pink-50 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2" />

                    <div className="relative">
                        <svg viewBox="0 0 100 100" className="w-64 h-64 transform -rotate-90">
                            {/* Background Ring */}
                            <circle
                                cx="50" cy="50" r="40"
                                fill="transparent"
                                stroke="#f1f5f9"
                                strokeWidth="8"
                            />
                            {/* Progress Ring */}
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
                            <motion.p className="text-7xl font-black text-slate-900 tracking-tighter">
                                {score}
                            </motion.p>
                            <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                <ArrowUpRight className="w-3 h-3" /> Excellent
                            </div>
                        </div>
                    </div>

                    <div className="text-center space-y-2">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight italic">Tier 4: Protocol Guardian</h3>
                        <p className="text-sm text-slate-500 font-medium px-8 leading-relaxed">
                            Your consistent deposits and non-default history place you in the top 2% of Moigye users.
                        </p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                        { label: "Total Staked", val: "12,450 CTC", icon: <Coins className="w-6 h-6" />, color: "bg-blue-50 text-blue-900", spotlight: "rgba(30, 58, 138, 0.1)" },
                        { label: "Gye Rounds", val: "14 Won", icon: <CheckCircle2 className="w-6 h-6" />, color: "bg-emerald-50 text-emerald-600", spotlight: "rgba(16, 185, 129, 0.1)" },
                        { label: "Protocol Rank", val: "#142nd", icon: <TrendingUp className="w-6 h-6" />, color: "bg-indigo-50 text-indigo-900", spotlight: "rgba(79, 70, 229, 0.1)" },
                        { label: "Trust Nodes", val: "8 Active", icon: <Zap className="w-6 h-6" />, color: "bg-orange-50 text-orange-600", spotlight: "rgba(249, 115, 22, 0.1)" }
                    ].map((stat, i) => (
                        <SpotlightCard
                            key={i}
                            spotlightColor={stat.spotlight}
                            className="glass-morphism rounded-[2.5rem] p-8 flex flex-col justify-between space-y-6 bg-white border border-slate-100/50 hover:-translate-y-1 transition-transform"
                        >
                            <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center shadow-sm`}>
                                {stat.icon}
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                                <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.val}</p>
                            </div>
                        </SpotlightCard>
                    ))}

                    {/* Large Staking CTA */}
                    <div className="md:col-span-2 group relative h-48 rounded-[2.5rem] overflow-hidden shadow-premium cursor-pointer transition-transform hover:scale-[1.01] active:scale-[0.99] border border-slate-200/50">
                        <div className="absolute inset-0 bg-slate-900 z-0" />
                        <div className="absolute inset-0 mesh-gradient opacity-10 z-1" />
                        <div className="relative z-10 h-full p-8 flex items-center justify-between text-white">
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black tracking-tight">Boost Your Credit Score.</h3>
                                <p className="text-sm opacity-60 font-medium">Stake CTC to unlock higher bidding limits and lower interest.</p>
                            </div>
                            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-white group-hover:text-slate-900 transition-all duration-300">
                                <ArrowUpRight className="w-8 h-8" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* History Table */}
            <div className="space-y-8 pt-8">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <History className="w-8 h-8 text-slate-400" />
                    Recent Activity
                </h2>

                <div className="glass-morphism rounded-[3rem] overflow-hidden bg-white border border-slate-100/50">
                    <div className="p-4 space-y-1">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="flex items-center justify-between p-6 rounded-2xl hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                                        <LayoutGrid className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">Participated in Gye #{300 + item}</p>
                                        <p className="text-xs text-slate-400 font-medium tracking-tight">Completed on May 12, 2026</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-slate-900">+$250 USDC</p>
                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Successful Payout</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
