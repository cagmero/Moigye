"use client";

import React from "react";
import { motion } from "framer-motion";
import { Gavel, Search, Plus, Filter, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ArenaOverviewPage() {
    return (
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-12 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <h1 className="text-6xl font-black text-slate-900 tracking-tighter italic uppercase underline decoration-blue-500/20">The Arena.</h1>
                    <p className="text-xl text-slate-500 font-medium">Real-time discount bidding for decentralized capital.</p>
                </div>
                <Link href="/lobby">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="premium-button px-10 py-5 bg-slate-900 flex items-center gap-3 shadow-xl shadow-slate-900/10"
                    >
                        <Plus className="w-5 h-5" />
                        Find Active Match
                    </motion.button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-morphism rounded-[3rem] p-12 bg-white border border-slate-100/50 flex flex-col justify-between h-[400px]">
                    <div className="space-y-6">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                            <Gavel className="w-8 h-8" />
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Nak-chal-gye <br /> Mechanism</h2>
                        <p className="text-slate-500 font-medium leading-relaxed">
                            Users bid discounts on the total pot. The highest discount wins the right to receive the payout this round, contributing the discount back to other members as yield.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-blue-600 font-black tracking-widest uppercase text-xs cursor-pointer">
                        Read protocol docs <ArrowRight className="w-4 h-4" />
                    </div>
                </div>

                <div className="glass-morphism rounded-[3rem] p-12 bg-slate-900 text-white relative overflow-hidden h-[400px]">
                    <div className="absolute inset-0 mesh-gradient opacity-20" />
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <div className="space-y-6">
                            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                <Plus className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-4xl font-black tracking-tight">Create Private <br /> Game Lobby</h2>
                            <p className="opacity-60 font-medium leading-relaxed">
                                Invite members to your private circle or open a public lobby for decentralized matchmaking across cross-chain spokes.
                            </p>
                        </div>
                        <Link href="/lobby">
                            <button className="w-full py-5 bg-white text-slate-900 rounded-full font-black tracking-tighter text-lg">
                                Setup Lobby
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
