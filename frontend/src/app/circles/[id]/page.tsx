"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Gavel, Trophy, AlertCircle, ArrowLeft, Users, DollarSign, Play, Loader2, CheckCircle2 } from "lucide-react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { GYE_MANAGER_CONTRACT, BIDDING_ENGINE_CONTRACT } from "@/lib/contracts";
import Link from "next/link";

export default function CircleRoomPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params);
    const { address } = useAccount();
    const groupId = BigInt(id);

    const [myBid, setMyBid] = useState("");

    // 1. Read group metadata from GyeManager (always populated after createGroup)
    const { data: gyeGroup, isLoading: gyeLoading } = useReadContract({
        ...GYE_MANAGER_CONTRACT,
        functionName: "groups",
        args: [groupId],
    });

    // 2. Read bidding state from BiddingEngine (only populated after startAuction)
    const { data: biddingGroup, refetch: refetchBidding } = useReadContract({
        ...BIDDING_ENGINE_CONTRACT,
        functionName: "groups",
        args: [groupId],
    });

    // 3. Bidding TX
    const { writeContract, data: hash, isPending: isSubmitting } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    useEffect(() => {
        if (isConfirmed) {
            refetchBidding();
            setMyBid("");
        }
    }, [isConfirmed, refetchBidding]);

    const handlePlaceBid = () => {
        if (!myBid || isSubmitting) return;
        writeContract({
            ...BIDDING_ENGINE_CONTRACT,
            functionName: "submitBid",
            args: [groupId, BigInt(myBid)],
        });
    };

    const handleStartAuction = () => {
        writeContract({
            ...GYE_MANAGER_CONTRACT,
            functionName: "startAuction",
            args: [groupId],
            gas: BigInt(500000),
        });
    };

    // Loading state
    if (gyeLoading || !gyeGroup) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
        );
    }

    // Destructure GyeManager group (9 fields: groupId, moderator, fixedDeposit, minScoreRequired, maxParticipants, biddingDate, isPublic, isActive, started)
    const gyeData = gyeGroup as readonly [bigint, string, bigint, bigint, bigint, bigint, boolean, boolean, boolean];
    const [gGroupId, moderator, fixedDeposit, , maxParticipants, biddingDate, isPublic, isActive, started] = gyeData;

    // Destructure BiddingEngine group (8 fields)
    const bidData = biddingGroup as readonly [bigint, bigint, bigint, bigint, string, number, bigint, bigint] | undefined;
    const [, monthlyContribution, biddingTimestamp, highestBid, highestBidder, phase, ,] = bidData ?? [0n, 0n, 0n, 0n, "0x0000000000000000000000000000000000000000", 0, 0n, 0n];

    const phaseNames = ["Waiting", "Deposit Window", "Active Bidding", "Voting", "Final Challenge", "Completed"];
    const isBiddingActive = phase === 2 || phase === 4;
    const auctionStarted = started;

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-10 animate-in fade-in duration-700">
            {/* Back */}
            <Link href="/circles" className="group inline-flex items-center gap-2 text-sm font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                All Circles
            </Link>

            {/* Group Overview Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative h-[300px] rounded-[3rem] overflow-hidden shadow-premium"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 z-0" />
                <div className="relative z-10 p-12 h-full flex flex-col justify-between text-white">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <p className="text-xs font-black uppercase tracking-[0.3em] opacity-60">
                                {isPublic ? "Public Circle" : "Private Circle"}
                            </p>
                            <h1 className="text-5xl font-black tracking-tight">Circle #{id}</h1>
                        </div>
                        <div className={`backdrop-blur-md px-6 py-2 rounded-full flex items-center gap-3 border ${auctionStarted && isBiddingActive
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : auctionStarted
                                ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                                : "bg-white/10 border-white/20 text-white"
                            }`}>
                            <div className={`w-2 h-2 rounded-full ${auctionStarted && isBiddingActive ? "bg-emerald-400 animate-pulse" : "bg-slate-400"}`} />
                            <span className="text-sm font-black tracking-widest uppercase">
                                {auctionStarted ? phaseNames[phase] : "Pending Auction"}
                            </span>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-8">
                        <div><p className="text-[10px] font-black uppercase tracking-widest opacity-60">Fixed Deposit</p><p className="text-3xl font-black">${Number(fixedDeposit).toLocaleString()}</p></div>
                        <div><p className="text-[10px] font-black uppercase tracking-widest opacity-60">Max Members</p><p className="text-3xl font-black">{Number(maxParticipants)}</p></div>
                        <div><p className="text-[10px] font-black uppercase tracking-widest opacity-60">Bidding Date</p><p className="text-3xl font-black">{new Date(Number(biddingDate) * 1000).toLocaleDateString()}</p></div>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Group Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-morphism rounded-[2.5rem] p-8 border border-white/40 space-y-4">
                        <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-600" /> Group Info
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-2xl">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Moderator</p>
                                <p className="text-sm font-mono text-slate-700 truncate">{moderator}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Is Your Circle</p>
                                <p className="text-sm font-black text-slate-900">{moderator?.toLowerCase() === address?.toLowerCase() ? "Yes — You're the Moderator" : "No"}</p>
                            </div>
                        </div>

                        {/* Start Auction — only visible to the moderator before auction starts */}
                        {moderator?.toLowerCase() === address?.toLowerCase() && !auctionStarted && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleStartAuction}
                                disabled={isSubmitting || isConfirming}
                                className="w-full flex items-center justify-center gap-3 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-60"
                            >
                                {(isSubmitting || isConfirming)
                                    ? <><Loader2 className="w-5 h-5 animate-spin" /> {isConfirming ? "Confirming..." : "Starting..."}</>
                                    : <><Play className="w-5 h-5 fill-current" /> Start Auction Round</>
                                }
                            </motion.button>
                        )}
                        {moderator?.toLowerCase() === address?.toLowerCase() && auctionStarted && (
                            <div className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-50 text-emerald-700 font-black rounded-2xl border border-emerald-100">
                                <CheckCircle2 className="w-5 h-5" /> Auction is Live
                            </div>
                        )}
                    </div>

                    {/* Top Bidder (only if auction started) */}
                    {auctionStarted && (
                        <div className="glass-morphism rounded-[2.5rem] p-8 border border-white/40 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                                    <Trophy className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Top Bidder</p>
                                    <p className="text-sm font-mono font-bold text-slate-900">{highestBidder === "0x0000000000000000000000000000000000000000" ? "No bids yet" : highestBidder}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Discount Offered</p>
                                <p className="text-3xl font-black text-blue-600">${highestBid?.toString() ?? "0"}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Bid Panel */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-morphism rounded-[3rem] p-8 flex flex-col justify-between space-y-6 border border-white/40"
                >
                    <div className="space-y-3">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <Gavel className="w-6 h-6 text-blue-600" /> Place Bid
                        </h3>
                        <p className="text-sm text-slate-500 font-medium">Higher discount = higher win chance, lower payout.</p>
                    </div>

                    {!auctionStarted ? (
                        <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3 text-amber-700">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <p className="text-xs font-bold">Auction hasn't started yet. The moderator needs to call <code>startAuction</code> to open the bidding window.</p>
                        </div>
                    ) : !isBiddingActive ? (
                        <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3 text-amber-700">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <p className="text-xs font-bold">Bidding is not currently active. Current phase: <strong>{phaseNames[phase]}</strong></p>
                        </div>
                    ) : (
                        <div className="relative">
                            <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                            <input
                                type="number"
                                value={myBid}
                                onChange={(e) => setMyBid(e.target.value)}
                                placeholder="0"
                                className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-slate-900 transition-all font-black text-2xl"
                            />
                        </div>
                    )}

                    <motion.button
                        whileHover={{ scale: isBiddingActive ? 1.02 : 1 }}
                        whileTap={{ scale: isBiddingActive ? 0.98 : 1 }}
                        onClick={handlePlaceBid}
                        disabled={!isBiddingActive || isSubmitting || isConfirming}
                        className={`w-full premium-button py-5 text-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {isSubmitting ? "Sending..." : isConfirming ? "Confirming..." : "Submit Bid"}
                    </motion.button>
                </motion.div>
            </div>
        </div>
    );
}

