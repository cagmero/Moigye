"use client";

import React from "react";
import { motion } from "framer-motion";
import { Plus, Search, Globe, Shield, History } from "lucide-react";
import Link from "next/link";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
} as const;

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
} as const;

const cards = [
    {
        href: "/lobby/create",
        icon: <Plus className="w-7 h-7" />,
        iconBg: "bg-slate-900 text-white shadow-xl shadow-slate-900/20",
        accent: <Plus className="w-24 h-24 text-slate-900" />,
        title: "Start Circle",
        desc: "Deploy a private or public ROSCA group on-chain.",
    },
    {
        href: "/lobby/discover",
        icon: <Search className="w-7 h-7" />,
        iconBg: "bg-blue-50/50 border border-blue-100 text-blue-900",
        accent: <Globe className="w-24 h-24 text-slate-900" />,
        title: "Find Pools",
        desc: "Join vetted public matchmaking groups instantly.",
    },
    {
        href: "/lobby/history",
        icon: <History className="w-7 h-7" />,
        iconBg: "bg-indigo-50 border border-indigo-100 text-indigo-700",
        accent: <History className="w-24 h-24 text-slate-900" />,
        title: "My History",
        desc: "Track your bids, wins, and participation across all rounds.",
    },
];

export default function LobbyPage() {
    return (
        <div className="min-h-screen bg-[#FAFAFA] selection:bg-slate-200">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="max-w-7xl mx-auto px-6 py-20 space-y-24"
            >
                {/* Hero */}
                <motion.div className="text-center space-y-8" variants={itemVariants}>
                    <h1 className="text-7xl md:text-8xl font-black text-slate-900 leading-[1.1] tracking-[-0.05em]">
                        The Future of <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-slate-900 to-indigo-600">
                            Social Finance.
                        </span>
                    </h1>
                    <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
                        Connect deeply through decentralized Gye.
                        Moigye empowers communities with trustless bidding and transparent yield.
                    </p>
                    <div className="flex justify-center gap-6 pt-4">
                        <Link href="/lobby/create">
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="premium-button text-lg px-10 py-5">
                                Create Protocol
                            </motion.button>
                        </Link>
                        <Link href="/lobby/discover">
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="secondary-button text-lg px-10 py-5">
                                Explore Pools
                            </motion.button>
                        </Link>
                    </div>
                </motion.div>

                {/* Quick Actions Grid */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {cards.map((card) => (
                        <Link href={card.href} key={card.href}>
                            <div className="group p-10 bg-white border border-slate-200/50 rounded-[2.5rem] shadow-premium hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden relative h-full">
                                <div className="absolute top-0 right-0 p-8 opacity-[0.04] group-hover:scale-110 transition-transform">
                                    {card.accent}
                                </div>
                                <div className="space-y-5 relative z-10">
                                    <div className={`w-14 h-14 rounded-3xl flex items-center justify-center shadow-sm ${card.iconBg}`}>
                                        {card.icon}
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900">{card.title}</h2>
                                    <p className="text-base text-slate-500 font-medium">{card.desc}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </motion.div>

                {/* Moderator link */}
                <motion.div variants={itemVariants} className="text-center">
                    <Link
                        href="/lobby/moderate"
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black tracking-widest uppercase text-[10px] transition-colors"
                    >
                        <Shield className="w-4 h-4" />
                        Access Moderator Control Panel
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
}
