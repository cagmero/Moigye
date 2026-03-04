"use client";

import React from "react";
import { motion } from "framer-motion";
import { Wallet, Menu } from "lucide-react";

export default function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between glass-morphism px-8 py-3 rounded-full">
                {/* Logo */}
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = '/'}>
                    <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-xl">
                        M
                    </div>
                    <span className="text-xl font-black text-slate-900 tracking-tighter">MOIGYE</span>
                </div>

                {/* Links */}
                <div className="hidden md:flex items-center gap-10">
                    {['Lobby', 'Arena', 'Credit', 'Governance'].map((item) => (
                        <a
                            key={item}
                            href={`/${item.toLowerCase()}`}
                            className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest"
                        >
                            {item}
                        </a>
                    ))}
                </div>

                {/* Action */}
                <div className="flex items-center gap-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="premium-button flex items-center gap-2 bg-gradient-to-r from-slate-900 to-blue-900"
                    >
                        <Wallet className="w-4 h-4" />
                        Connect
                    </motion.button>

                    <button className="md:hidden p-2 text-slate-500 hover:text-slate-900">
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </nav>
    );
}
