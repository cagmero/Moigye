"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Menu, LogOut, ChevronDown, Copy, Check, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import SBTBadge from "./SBTBadge";

export default function Navbar() {
    const { login, logout, authenticated, user, linkWallet } = usePrivy();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const truncateAddress = (address: string) => {
        if (!address) return "";
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const copyToClipboard = async () => {
        const address = user?.wallet?.address;
        if (address) {
            await navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const identifier = user?.wallet?.address
        ? truncateAddress(user.wallet.address)
        : user?.email?.address || "Connected";

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between glass-morphism px-8 py-3 rounded-full border border-white/40 shadow-premium relative">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 cursor-pointer">
                    <img src="/logo.svg" alt="Moigye Logo" className="w-8 h-8 rounded-lg object-contain" />
                    <span className="text-xl font-black text-slate-900 tracking-tighter">MOIGYE</span>
                </Link>

                {/* Links */}
                <div className="hidden md:flex items-center gap-12">
                    {[
                        { label: 'Lobby', href: '/lobby' },
                        { label: 'Circles', href: '/circles' },
                        { label: 'Credit', href: '/credit' },
                        { label: 'Whitepaper', href: '/whitepaper' },
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
                        <div className="relative" ref={menuRef}>
                            <motion.div
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="flex items-center gap-3 px-5 py-2.5 bg-white border border-slate-200 rounded-full cursor-pointer hover:border-slate-300 transition-colors shadow-sm"
                            >
                                <SBTBadge status="Trusted" />
                                <div className="w-1 h-4 w-px bg-slate-100 hidden sm:block" />
                                <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center">
                                    <Wallet className="w-3 h-3 text-white" />
                                </div>
                                <span className="text-sm font-black text-slate-900 tracking-tight">{identifier}</span>
                                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                            </motion.div>

                            <AnimatePresence>
                                {isMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-4 w-64 glass-morphism p-4 rounded-[2rem] border border-white/40 shadow-2xl z-[60] bg-white/90 backdrop-blur-xl"
                                    >
                                        <div className="space-y-1">
                                            <button
                                                onClick={copyToClipboard}
                                                className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-700">Copy Address</span>
                                                </div>
                                                {copied && <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Copied</span>}
                                            </button>

                                            <button
                                                onClick={() => { linkWallet(); setIsMenuOpen(false); }}
                                                className="w-full flex items-center gap-3 p-4 rounded-2xl hover:bg-slate-50 transition-colors group"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                    <ShieldCheck className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm font-bold text-slate-700">Manage Wallets</span>
                                            </button>

                                            <div className="h-px bg-slate-100 my-2 mx-2" />

                                            <button
                                                onClick={() => { logout(); setIsMenuOpen(false); }}
                                                className="w-full flex items-center gap-3 p-4 rounded-2xl hover:bg-red-50 transition-colors group text-red-600"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                                                    <LogOut className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm font-bold">Disconnect</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
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
