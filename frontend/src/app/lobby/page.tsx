"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Filter, ArrowRight, ArrowUpDown, Globe, Shield, Users, DollarSign, Calendar, Loader2 } from "lucide-react";
import SplitText from "@/components/SplitText";
import DiscoveryExplorer from "@/components/DiscoveryExplorer";
import ModeratorPanel from "@/components/ModeratorPanel";
import SpotlightCard from "@/components/SpotlightCard";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { GYE_MANAGER_CONTRACT } from "@/lib/contracts";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
} as const;

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
} as const;

export default function LobbyPage() {
    const [view, setView] = useState<"landing" | "create" | "discover" | "moderate">("landing");

    // Create Group Form State
    const [isPublic, setIsPublic] = useState(true);
    const [deposit, setDeposit] = useState("1000");
    const [maxParticipants, setMaxParticipants] = useState("10");
    const [biddingDate, setBiddingDate] = useState("");

    // Contract Interaction
    const { writeContract, data: hash, isPending: isCreating } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    useEffect(() => {
        if (isConfirmed) {
            setView("landing");
            // Ideally redirect to /circles or show success toast
        }
    }, [isConfirmed]);

    const handleCreateGroup = () => {
        if (!deposit || !maxParticipants || !biddingDate || isCreating) return;

        const dateTimestamp = Math.floor(new Date(biddingDate).getTime() / 1000);

        writeContract({
            ...GYE_MANAGER_CONTRACT,
            functionName: "createGroup",
            args: [
                isPublic,
                BigInt(deposit),
                BigInt(maxParticipants),
                BigInt(dateTimestamp)
            ],
        });
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] selection:bg-slate-200">
            <AnimatePresence mode="wait">
                {view === "landing" && (
                    <motion.div
                        key="landing"
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, y: -20 }}
                        variants={containerVariants}
                        className="max-w-7xl mx-auto px-6 py-20 space-y-32"
                    >
                        {/* Hero */}
                        <motion.div className="text-center space-y-8" variants={itemVariants}>
                            <h1 className="text-7xl md:text-8xl font-black text-slate-900 leading-[1.1] tracking-[-0.05em]">
                                <SplitText
                                    text="The Future of social finance"
                                    className="block"
                                    delay={30}
                                    duration={0.8}
                                    splitType="chars"
                                />
                                <SplitText
                                    text="Social Finance."
                                    className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-slate-900 to-indigo-600 block"
                                    delay={30}
                                    duration={0.8}
                                    splitType="chars"
                                />
                            </h1>
                            <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
                                Connect deeply through decentralized Gye.
                                Moigye empowers communities with trustless bidding and transparent yield.
                            </p>

                            <div className="flex justify-center gap-6 pt-8">
                                <SpotlightCard spotlightColor="rgba(37, 99, 235, 0.2)" className="p-0 border-0 bg-transparent rounded-2xl overflow-visible">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setView("create")}
                                        className="premium-button text-lg px-10 py-5"
                                    >
                                        Create Protocol
                                    </motion.button>
                                </SpotlightCard>
                                <SpotlightCard spotlightColor="rgba(71, 85, 105, 0.2)" className="p-0 border-0 bg-transparent rounded-2xl overflow-visible">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setView("discover")}
                                        className="secondary-button text-lg px-10 py-5"
                                    >
                                        Explore Pools
                                    </motion.button>
                                </SpotlightCard>
                            </div>
                        </motion.div>

                        {/* Quick Actions Grid */}
                        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <SpotlightCard
                                spotlightColor="rgba(15, 23, 42, 0.1)"
                                className="group p-12 bg-white border border-slate-200/50 rounded-[2.5rem] shadow-premium hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden relative"
                            >
                                <div onClick={() => setView("create")}>
                                    <div className="absolute top-0 right-0 p-12 opacity-[0.05] group-hover:scale-110 transition-transform">
                                        <Plus className="w-32 h-32 text-slate-900" />
                                    </div>
                                    <div className="space-y-6 relative z-10">
                                        <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-slate-900/20">
                                            <Plus className="w-8 h-8" />
                                        </div>
                                        <h2 className="text-4xl font-black text-slate-900">Start Circle</h2>
                                        <p className="text-lg text-slate-500 font-medium">Deploy a private or public ROSCA group on-chain.</p>
                                    </div>
                                </div>
                            </SpotlightCard>

                            <SpotlightCard
                                spotlightColor="rgba(37, 99, 235, 0.1)"
                                className="group p-12 bg-white border border-slate-200/50 rounded-[2.5rem] shadow-premium hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden relative"
                            >
                                <div onClick={() => setView("discover")}>
                                    <div className="absolute top-0 right-0 p-12 opacity-[0.05] group-hover:scale-110 transition-transform">
                                        <Globe className="w-32 h-32 text-slate-900" />
                                    </div>
                                    <div className="space-y-6 relative z-10">
                                        <div className="w-16 h-16 bg-blue-50/50 border border-blue-100 rounded-3xl flex items-center justify-center text-blue-900 shadow-sm">
                                            <Search className="w-8 h-8" />
                                        </div>
                                        <h2 className="text-4xl font-black text-slate-900">Find Pools</h2>
                                        <p className="text-lg text-slate-500 font-medium">Join vetted public matchmaking groups instantly.</p>
                                    </div>
                                </div>
                            </SpotlightCard>
                        </motion.div>

                        <motion.div variants={itemVariants} className="text-center">
                            <button
                                onClick={() => setView("moderate")}
                                className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black tracking-widest uppercase text-[10px] transition-colors"
                            >
                                <Shield className="w-4 h-4" />
                                Access Moderator Control Panel
                            </button>
                        </motion.div>
                    </motion.div>
                )}

                {view === "create" && (
                    <motion.div
                        key="create"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="max-w-2xl mx-auto px-6 py-20 space-y-12"
                    >
                        <button
                            onClick={() => setView("landing")}
                            className="group flex items-center gap-2 text-sm font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest"
                        >
                            <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                            Back home
                        </button>

                        <div className="glass-morphism p-12 rounded-[3rem] space-y-10 border border-white/40 shadow-premium">
                            <div className="flex justify-between items-center">
                                <div className="space-y-1">
                                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter">New Gye Group</h2>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Creditcoin Network Setup</p>
                                </div>
                                <div
                                    onClick={() => setIsPublic(!isPublic)}
                                    className={`w-16 h-8 rounded-full cursor-pointer transition-colors relative flex items-center ${isPublic ? 'bg-blue-600' : 'bg-slate-300'}`}
                                >
                                    <motion.div
                                        animate={{ x: isPublic ? 34 : 4 }}
                                        className="w-6 h-6 bg-white rounded-full shadow-lg"
                                    />
                                </div>
                            </div>

                            <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100/50 flex items-center gap-5">
                                {isPublic ? (
                                    <>
                                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                            <Globe className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 uppercase tracking-wider">Public visibility</p>
                                            <p className="text-xs text-slate-500 font-medium">Anyone can discover and join this group instantly.</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                                            <Shield className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 uppercase tracking-wider">Private Circle</p>
                                            <p className="text-xs text-slate-500 font-medium">You must manually verify and approve each join request.</p>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Fixed Deposit (USDC)</label>
                                        <input
                                            type="number"
                                            value={deposit}
                                            onChange={(e) => setDeposit(e.target.value)}
                                            placeholder="1000"
                                            className="w-full p-6 bg-white border border-slate-200 rounded-3xl outline-none focus:border-slate-900 focus:shadow-premium transition-all font-black text-xl"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Max Participants</label>
                                        <input
                                            type="number"
                                            value={maxParticipants}
                                            onChange={(e) => setMaxParticipants(e.target.value)}
                                            placeholder="10"
                                            className="w-full p-6 bg-white border border-slate-200 rounded-3xl outline-none focus:border-slate-900 focus:shadow-premium transition-all font-black text-xl"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Initial Bidding Date</label>
                                    <input
                                        type="datetime-local"
                                        value={biddingDate}
                                        onChange={(e) => setBiddingDate(e.target.value)}
                                        className="w-full p-6 bg-white border border-slate-200 rounded-3xl outline-none focus:border-slate-900 focus:shadow-premium transition-all font-black text-xl"
                                    />
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={isCreating || isConfirming}
                                onClick={handleCreateGroup}
                                className="premium-button w-full py-6 text-xl flex items-center justify-center gap-3"
                            >
                                {isCreating ? <Loader2 className="w-6 h-6 animate-spin" /> : null}
                                {isCreating ? "Initializing..." : isConfirming ? "Confirming..." : "Deploy Circle"}
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {view === "discover" && <DiscoveryExplorer onBack={() => setView("landing")} />}
                {view === "moderate" && <ModeratorPanel onBack={() => setView("landing")} />}
            </AnimatePresence>
        </div>
    );
}
