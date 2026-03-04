"use client";

import React from "react";
import { motion } from "framer-motion";
import { Vote, Shield, FileText, ArrowUpRight, Lock, Users } from "lucide-react";

export default function GovernancePage() {
    return (
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-12 animate-in fade-in duration-700">
            <div className="space-y-4">
                <h1 className="text-6xl font-black text-slate-900 tracking-tighter">Governance.</h1>
                <p className="text-xl text-slate-500 font-medium">Shape the future of the Moigye protocol.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Active Proposals Placeholder */}
                    <div className="glass-morphism rounded-[3rem] p-12 bg-white border border-slate-100/50 space-y-10">
                        <div className="flex items-center justify-between">
                            <h2 className="text-3xl font-black tracking-tight">Active Proposals</h2>
                            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest">
                                <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                                Voting Phase
                            </div>
                        </div>

                        <div className="space-y-6">
                            {[
                                { title: "MIP-04: Adjust Staking Requirements", status: "Active", desc: "Lower the minimum CTC staking requirement for Arena Tier 2 from 5000 to 2500." },
                                { title: "MIP-03: Implement Arbitrum Spoke", status: "Active", desc: "Deploy the MoigyeVault to Arbitrum for lower deposit fees on small pools." }
                            ].map((proposal, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ y: -2 }}
                                    className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-white transition-all cursor-pointer group"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{proposal.title}</h3>
                                        <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-colors" />
                                    </div>
                                    <p className="text-slate-500 font-medium leading-relaxed">{proposal.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-8">
                    <div className="glass-morphism rounded-[3rem] p-10 bg-slate-900 text-white relative overflow-hidden">
                        <div className="absolute inset-0 mesh-gradient opacity-10" />
                        <div className="relative z-10 space-y-6">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Voting Power</p>
                                <p className="text-4xl font-black tracking-tighter">1,245.8</p>
                            </div>
                            <p className="text-xs font-medium opacity-60">Derived from your total staked CTC and successful Gye rounds.</p>
                        </div>
                    </div>

                    <div className="glass-morphism rounded-[3rem] p-10 bg-white border border-slate-100/50 space-y-8">
                        <h3 className="text-xl font-black tracking-tight">Protocol Metrics</h3>
                        <div className="space-y-6">
                            {[
                                { label: "Treasury", val: "$1.4M", icon: <Lock className="w-4 h-4" /> },
                                { label: "Voters", val: "2,450", icon: <Users className="w-4 h-4" /> },
                                { label: "Proposals", val: "14", icon: <FileText className="w-4 h-4" /> }
                            ].map((m, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-slate-400">
                                        {m.icon}
                                        <span className="text-xs font-black uppercase tracking-widest">{m.label}</span>
                                    </div>
                                    <span className="font-black text-slate-900">{m.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
