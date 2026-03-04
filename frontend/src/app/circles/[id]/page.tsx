"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gavel, Trophy, User, ArrowUpRight, CheckCircle2, XCircle, DollarSign, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent } from "wagmi";
import { BIDDING_ENGINE_CONTRACT } from "@/lib/contracts";
import { formatEther, parseEther } from "viem";

interface Bid {
    id: string;
    bidder: string;
    discount: number;
    timestamp: string;
}

export default function CircleRoomPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params);
    const { address } = useAccount();
    const groupId = BigInt(id);

    const [myBid, setMyBid] = useState("");
    const [bids, setBids] = useState<Bid[]>([]);

    // 1. Fetch Group State
    const { data: group, refetch: refetchGroup } = useReadContract({
        ...BIDDING_ENGINE_CONTRACT,
        functionName: "groups",
        args: [groupId],
    });

    // 2. Bidding Transaction
    const { writeContract, data: hash, isPending: isSubmitting } = useWriteContract();

    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
    });

    // 3. Watch for Bids
    useWatchContractEvent({
        ...BIDDING_ENGINE_CONTRACT,
        eventName: 'BidPlaced',
        onLogs(logs) {
            refetchGroup();
            // We could also append to local bids state here for immediate feedback
        },
    });

    useEffect(() => {
        if (isConfirmed) {
            refetchGroup();
            setMyBid("");
        }
    }, [isConfirmed, refetchGroup]);

    const handlePlaceBid = () => {
        if (!myBid || isSubmitting) return;

        writeContract({
            ...BIDDING_ENGINE_CONTRACT,
            functionName: "submitBid",
            args: [groupId, BigInt(myBid)],
        });
    };

    if (!group) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
    );

    const [groupIdFromContract, monthlyContribution, biddingTimestamp, highestBid, highestBidder, phase, positiveVotes, votingEndTime] = group as [bigint, bigint, bigint, bigint, string, number, bigint, bigint];

    // Phases: 0: Idle, 1: Deposit, 2: BiddingR1, 3: Voting, 4: FinalChallenge, 5: Completed
    const phaseNames = ["Waiting", "Deposit Window", "Active Bidding", "Voting", "Final Challenge", "Completed"];
    const isBiddingActive = phase === 2 || phase === 4;

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-12 animate-in fade-in duration-700">
            {/* Top Section: Pot Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-2 relative h-[400px] rounded-[3rem] overflow-hidden shadow-premium border border-slate-200/50"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 opacity-[0.95] z-0" />
                    <div className="absolute inset-0 mesh-gradient opacity-30 z-1" />

                    <div className="relative z-10 p-12 h-full flex flex-col justify-between text-white">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="text-xs font-black uppercase tracking-[0.3em] opacity-60">Live Bidding Engine</p>
                                <h2 className="text-4xl font-black tracking-tight">Circle #{id} Round</h2>
                            </div>
                            <div className={`backdrop-blur-md px-6 py-2 rounded-full flex items-center gap-3 border ${isBiddingActive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/10 border-white/20 text-white'}`}>
                                <div className={`w-2 h-2 rounded-full ${isBiddingActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                                <span className="text-sm font-black tracking-widest uppercase">{phaseNames[phase]}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-xs font-black uppercase tracking-[0.3em] opacity-60">Estimated Pot Size</p>
                            <div className="flex items-baseline gap-4">
                                <motion.span className="text-8xl md:text-9xl font-black tracking-tighter">
                                    ${Number(monthlyContribution).toLocaleString()}
                                </motion.span>
                                <div className="flex items-center gap-1 text-emerald-400 font-black mb-4">
                                    <TrendingUp className="w-5 h-5" />
                                    <span>tCTC</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-8">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Bidding Starts</p>
                                <div className="flex items-center gap-2 text-xl font-black">
                                    <Clock className="w-5 h-5" />
                                    {new Date(Number(biddingTimestamp) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                            <div className="w-px h-10 bg-white/20" />
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Current High Discount</p>
                                <p className="text-xl font-black">${highestBid.toString()}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Bidding Action Column */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-morphism rounded-[3rem] p-10 flex flex-col justify-between space-y-8"
                >
                    <div className="space-y-6">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Place Your Bid</h3>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                            A higher discount increases your win probability but reduces your final checkout.
                        </p>
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-4">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">
                                <span>Discount Amount</span>
                            </div>
                            <div className="relative">
                                <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300" />
                                <input
                                    type="number"
                                    value={myBid}
                                    onChange={(e) => setMyBid(e.target.value)}
                                    placeholder="0"
                                    disabled={!isBiddingActive}
                                    className="w-full pl-16 pr-8 py-6 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:border-slate-900 focus:shadow-premium transition-all font-black text-3xl disabled:opacity-50"
                                />
                            </div>
                        </div>

                        {!isBiddingActive && (
                            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-3 text-amber-700">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p className="text-xs font-bold leading-tight">Bidding is not active. Please wait for the moderator to start the round.</p>
                            </div>
                        )}
                    </div>

                    <motion.button
                        whileHover={{ scale: isBiddingActive ? 1.02 : 1 }}
                        whileTap={{ scale: isBiddingActive ? 0.98 : 1 }}
                        onClick={handlePlaceBid}
                        disabled={!isBiddingActive || isSubmitting || isConfirming}
                        className={`w-full premium-button py-6 text-xl tracking-tight shadow-xl ${isBiddingActive ? 'bg-slate-900 shadow-slate-900/10' : 'bg-slate-300 cursor-not-allowed shadow-none'}`}
                    >
                        {isSubmitting ? "Sending..." : isConfirming ? "Confirming..." : "Submit Bid"}
                    </motion.button>
                </motion.div>
            </div>

            {/* Status Section */}
            <div className="space-y-8">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <User className="w-8 h-8 text-blue-600" />
                        Current Top Bidder
                    </h2>
                </div>

                <div className="glass-morphism rounded-[2.5rem] p-10 flex items-center justify-between border border-white/40">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                            <Trophy className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Address</p>
                            <p className="text-xl font-mono font-bold text-slate-900">{highestBidder === "0x0000000000000000000000000000000000000000" ? "No bids yet" : highestBidder}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Discount Offered</p>
                        <p className="text-4xl font-black text-blue-600">${highestBid.toString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
