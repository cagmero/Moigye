"use client";

import React from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { Users, Plus, ArrowRight, Compass, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { GYE_MANAGER_CONTRACT } from "@/lib/contracts";
import SpotlightCard from "@/components/SpotlightCard";
import SplitText from "@/components/SplitText";

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 100
        }
    }
};

interface Circle {
    id: string;
    moderator: string;
    fixedDeposit: number;
    maxParticipants: number;
    biddingDate: number;
    isPublic: boolean;
    isCircleActive: boolean;
    started: boolean;
}

export default function CirclesPage() {
    const { address } = useAccount();

    const { data: nextGroupId } = useReadContract({
        ...GYE_MANAGER_CONTRACT,
        functionName: "nextGroupId",
    });

    const totalGroups = nextGroupId ? Number(nextGroupId) : 0;
    const groupIds = Array.from({ length: totalGroups }, (_, i) => BigInt(i));

    const { data: groupsData } = useReadContracts({
        contracts: groupIds.map((id) => ({
            ...GYE_MANAGER_CONTRACT,
            functionName: "groups",
            args: [id],
        })),
    });

    const myCircles: Circle[] = (groupsData || [])
        .map((res) => {
            if (res && res.status === "success" && Array.isArray(res.result)) {
                const [groupId, moderator, fixedDeposit, maxParticipants, biddingDate, isPublic, isCircleActive, started] = res.result;

                return {
                    id: (groupId as bigint || BigInt(0)).toString(),
                    moderator: (moderator as string) || "0x0",
                    fixedDeposit: Number(fixedDeposit as bigint || BigInt(0)),
                    maxParticipants: Number(maxParticipants as bigint || BigInt(0)),
                    biddingDate: Number(biddingDate as bigint || BigInt(0)),
                    isPublic: !!isPublic,
                    isCircleActive: !!isCircleActive,
                    started: !!started
                };
            }
            return null;
        })
        .filter((g): g is Circle => {
            if (!g) return false;
            const isMod = g.moderator.toLowerCase() === address?.toLowerCase();
            return isMod || g.isCircleActive;
        });

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Users className="w-10 h-10 text-blue-600" />
                        <SplitText
                            text="Your Circles"
                            delay={30}
                            duration={0.8}
                        />
                    </h1>
                    <p className="text-slate-500 font-medium">Manage your active pool participations.</p>
                </div>

                <Link href="/lobby">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-black text-slate-900 shadow-sm hover:shadow-md transition-all"
                    >
                        <Compass className="w-5 h-5 text-blue-600" />
                        Discover Pools
                    </motion.button>
                </Link>
            </div>

            {myCircles.length > 0 ? (
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    <AnimatePresence mode="popLayout">
                        {myCircles.map((circle) => (
                            <SpotlightCard
                                key={circle.id}
                                spotlightColor="rgba(37, 99, 235, 0.15)"
                                className="bg-white p-8 rounded-[2.5rem] space-y-6 hover:-translate-y-2 transition-all cursor-pointer group border border-slate-200/60 shadow-premium relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="relative z-10 flex justify-between items-start">
                                    <div className="p-4 bg-slate-900 rounded-2xl text-white">
                                        <LayoutGrid className="w-6 h-6" />
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${circle.started ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                        {circle.started ? 'Live Auction' : 'Pending Start'}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Circle #{circle.id}</h3>
                                    <p className="text-xs font-mono text-slate-400 truncate">Mod: {circle.moderator}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100/50">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fixed Deposit</p>
                                        <p className="text-lg font-black text-slate-900">${circle.fixedDeposit}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Match Date</p>
                                        <p className="text-lg font-black text-slate-900">{new Date(circle.biddingDate * 1000).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <Link href={`/circles/${circle.id}`} className="relative z-10 block">
                                    <div className="w-full py-4 bg-slate-50 group-hover:bg-slate-900 group-hover:text-white rounded-2xl font-black transition-all flex items-center justify-center gap-2">
                                        Enter Circle
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </Link>
                            </SpotlightCard>
                        ))}
                    </AnimatePresence>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-32 space-y-6 glass-morphism rounded-[3rem]"
                >
                    <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto text-slate-300">
                        <Users className="w-10 h-10" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black text-slate-900">No Active Circles</h3>
                        <p className="text-slate-500">You haven't joined any pools yet. Start your journey in the lobby.</p>
                    </div>
                    <Link href="/lobby">
                        <button className="premium-button px-8 py-4">
                            Go to Lobby
                        </button>
                    </Link>
                </motion.div>
            )}
        </div>
    );
}
