"use client";

import React from "react";
import { motion } from "framer-motion";
import { Wallet, Menu, LogOut, ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import SBTBadge from "./SBTBadge";

export default function Navbar() {
    const { login, logout, authenticated, user } = usePrivy();

    const truncateAddress = (address: string) => {
        if (!address) return "";
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const identifier = user?.wallet?.address
        ? truncateAddress(user.wallet.address)
        : user?.email?.address || "Connected";

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between glass-morphism px-8 py-3 rounded-full border border-white/40 shadow-premium">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 cursor-pointer">
                    <img src="/logo.svg" alt="Moigye Logo" className="w-8 h-8 rounded-lg object-contain" />
                    <span className="text-xl font-black text-slate-900 tracking-tighter">MOIGYE</span>
                </Link>

                {/* Links */}
                <div className="hidden md:flex items-center gap-10">
                    {[
                        { label: 'Lobby', href: '/lobby' },
                        { label: 'Circles', href: '/circles' },
                        { label: 'Credit', href: '/credit' },
                        { label: 'Governance', href: '/governance' }
                    ].map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest"
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>

                {/* Action */}
                <div className="flex items-center gap-4">
                    {!authenticated ? (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={login}
                            className="premium-button flex items-center gap-2 bg-gradient-to-r from-slate-900 to-blue-900 shadow-xl shadow-slate-900/20"
                        >
                            <Wallet className="w-4 h-4" />
                            Connect
                        </motion.button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <motion.div
                                className="flex items-center gap-3 px-5 py-2.5 bg-white border border-slate-200 rounded-full cursor-pointer hover:border-slate-300 transition-colors shadow-sm"
                            >
                                <SBTBadge status="Trusted" />
                                <div className="w-1 h-4 w-px bg-slate-100 hidden sm:block" />
                                <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center">
                                    <Wallet className="w-3 h-3 text-white" />
                                </div>
                                <span className="text-sm font-black text-slate-900 tracking-tight">{identifier}</span>
                                <ChevronDown className="w-4 h-4 text-slate-400" />
                            </motion.div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={logout}
                                className="p-2.5 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-full transition-colors border border-slate-200/50"
                                title="Logout"
                            >
                                <LogOut className="w-4 h-4" />
                            </motion.button>
                        </div>
                    )}

                    <button className="md:hidden p-2 text-slate-500 hover:text-slate-900">
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </nav>
    );
}
