"use client";

import React, { useState, useEffect } from "react";
import { Gavel, Trophy, ArrowUpRight, CheckCircle2, XCircle, DollarSign, ShieldCheck, Lock, Loader2 } from "lucide-react";
import { useUserSync } from "@/hooks/useUserSync";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { GYE_MANAGER_CONTRACT } from "@/lib/contracts";
import { supabase } from "@/utils/supabaseClient";

interface Bid {
    bidder: string;
    amount: number;
}

export default function LiveArena({ groupId }: { groupId: number }) {
    const [bids, setBids] = useState<Bid[]>([]);
    const [myBid, setMyBid] = useState("");
    const { isBanned, loading: userSyncLoading } = useUserSync();
    const [isAuctionStarted, setIsAuctionStarted] = useState<boolean | null>(null); // null = loading
    const [roundNumber, setRoundNumber] = useState(1);
    const [showSatisfaction, setShowSatisfaction] = useState(false);
    const [isSettling, setIsSettling] = useState(false);
    const { address } = useAccount();

    // 1. Fetch auction state from the contract is more reliable for state
    const { data: gyeGroup } = useReadContract({
        ...GYE_MANAGER_CONTRACT,
        functionName: "groups",
        args: [BigInt(groupId)],
    });

    useEffect(() => {
        if (gyeGroup) {
            const [, , , , , , , , started] = gyeGroup as any;
            setIsAuctionStarted(started);
        }
    }, [gyeGroup]);

    // 2. Subscribe to groups table so bidding unlocks the moment creator starts it
    useEffect(() => {
        const channel = supabase
            .channel(`group-state-${groupId}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "groups",
                    filter: `group_id=eq.${groupId}`,
                },
                (payload) => {
                    setIsAuctionStarted(payload.new.is_auction_started);
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [groupId]);

    // 3. Fetch existing bids and subscribe to new ones
    useEffect(() => {
        const fetchBids = async () => {
            const { data, error } = await supabase
                .from("live_bids")
                .select("wallet_address, discount_amount")
                .eq("group_id", groupId)
                .order("discount_amount", { ascending: false });

            if (data) {
                setBids(data.map(b => ({ bidder: b.wallet_address, amount: Number(b.discount_amount) })));
            }
        };
        fetchBids();

        const channel = supabase
            .channel(`live-bids-${groupId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "live_bids",
                    filter: `group_id=eq.${groupId}`,
                },
                () => { fetchBids(); } // Refetch on any change for simplicity
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [groupId]);

    const handlePlaceBid = async () => {
        if (!myBid || !address || !isAuctionStarted) return;
        const amount = parseInt(myBid);
        if (isNaN(amount) || amount <= 0) return;

        // Upsert: if this wallet already bid, replace with higher amount
        const { error } = await supabase
            .from("live_bids")
            .upsert(
                {
                    group_id: groupId,
                    wallet_address: address.toLowerCase(),
                    discount_amount: amount,
                    placed_at: new Date().toISOString(),
                },
                { onConflict: "group_id,wallet_address" }
            );

        if (error) console.error("Error placing bid:", error);
        setMyBid("");
    };

    const handleSettle = async (satisfied: boolean) => {
        if (!satisfied || bids.length === 0) {
            setShowSatisfaction(false);
            return;
        }

        setIsSettling(true);

        // Archive all bids to bid_history
        const winner = bids[0];
        const historyRows = bids.map((bid, idx) => ({
            group_id: groupId,
            wallet_address: bid.bidder,
            discount_amount: bid.amount,
            did_win: idx === 0, // top bid wins
            round_number: roundNumber,
            completed_at: new Date().toISOString(),
        }));

        const { error: historyError } = await supabase.from("bid_history").insert(historyRows);
        if (historyError) console.error("Error saving bid history:", historyError);

        // Clear live bids for this group
        const { error: clearError } = await supabase
            .from("live_bids")
            .delete()
            .eq("group_id", groupId);
        if (clearError) console.error("Error clearing bids:", clearError);

        // Advance round
        setRoundNumber(prev => prev + 1);
        setBids([]);
        setShowSatisfaction(false);
        setIsSettling(false);
    };

    if (isAuctionStarted === null) {
        return (
            <div className="flex justify-center items-center py-32">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Leaderboard */}
                <div className="lg:col-span-2 glass-card overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/40">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <Gavel className="w-5 h-5 text-blue-900" />
                                Live Bidding Arena
                            </h2>
                            <p className="text-slate-500 text-sm font-medium">Group #{groupId} · Round {roundNumber}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {isAuctionStarted ? (
                                <>
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                    </span>
                                    <span className="text-emerald-700 text-xs font-bold uppercase tracking-widest">Live Auction</span>
                                </>
                            ) : (
                                <>
                                    <span className="relative flex h-3 w-3">
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-300"></span>
                                    </span>
                                    <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Waiting to Start</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="p-8 space-y-6">
                        {/* Bid list */}
                        {bids.length > 0 ? (
                            <div className="space-y-4">
                                {bids.map((bid, i) => (
                                    <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${i === 0 ? "bg-blue-50/50 border-blue-100 scale-[1.02] shadow-sm" : "bg-slate-50/30 border-slate-100"}`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${i === 0 ? "bg-blue-900 text-white" : "bg-white text-slate-400 border border-slate-200"}`}>
                                                {i + 1}
                                            </div>
                                            <div>
                                                <p className="font-mono text-sm font-bold text-slate-900">{bid.bidder.slice(0, 6)}...{bid.bidder.slice(-4)}</p>
                                                <p className="text-xs text-slate-500 font-medium">Active Bid</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-xl font-black ${i === 0 ? "text-blue-900" : "text-slate-900"}`}>${bid.amount}</p>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Discount Offered</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center text-slate-400 font-medium">
                                {isAuctionStarted ? "No bids yet. Be the first!" : "Auction room not open yet."}
                            </div>
                        )}

                        {/* Bid input — blocked if auction hasn't started */}
                        <div className="pt-6 flex gap-4">
                            {isBanned ? (
                                <div className="w-full bg-red-50 border border-red-100 p-6 rounded-2xl flex items-center justify-center gap-3 shadow-sm">
                                    <XCircle className="w-6 h-6 text-red-600" />
                                    <span className="text-sm font-black text-red-600 uppercase tracking-[0.2em]">Account Suspended: Default Detected</span>
                                </div>
                            ) : !isAuctionStarted ? (
                                <div className="w-full bg-slate-50 border border-slate-100 p-6 rounded-2xl flex items-center justify-center gap-3">
                                    <Lock className="w-5 h-5 text-slate-400" />
                                    <span className="text-sm font-bold text-slate-400">Waiting for pool creator to open the bidding round</span>
                                </div>
                            ) : (
                                <>
                                    <div className="flex-1 relative">
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="number"
                                            placeholder="Enter your discount bid..."
                                            value={myBid}
                                            onChange={(e) => setMyBid(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handlePlaceBid()}
                                            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900 outline-none transition-all"
                                        />
                                    </div>
                                    <button
                                        onClick={handlePlaceBid}
                                        disabled={userSyncLoading || !myBid}
                                        className="premium-button px-8 py-4 flex items-center gap-2 disabled:opacity-50"
                                    >
                                        Place Bid
                                        <ArrowUpRight className="w-5 h-5" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Current Winner & Settle */}
                <div className="glass-card p-8 flex flex-col justify-between items-center text-center space-y-6">
                    <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-2">
                        <Trophy className="w-10 h-10 text-blue-900" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Current Leader</h3>
                        <p className="text-blue-900 font-mono font-bold mt-1 text-sm">
                            {bids[0] ? `${bids[0].bidder.slice(0, 6)}...${bids[0].bidder.slice(-4)}` : "No bids yet"}
                        </p>
                    </div>
                    <div className="w-full space-y-4">
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-sm text-slate-500 font-medium">Estimated Payout Breakdown</p>
                            <div className="mt-4 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Immediate (70%)</span>
                                    <span className="text-lg font-black text-slate-900">${((bids[0]?.amount || 0) * 0.7).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bond (30%)</span>
                                    <span className="text-lg font-black text-blue-600">${((bids[0]?.amount || 0) * 0.3).toFixed(2)}</span>
                                </div>
                                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                                    <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Total Pot</span>
                                    <span className="text-xl font-black text-slate-900">${(bids[0]?.amount || 0).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-left">
                            <p className="text-[10px] text-blue-800 font-black uppercase tracking-[0.1em] leading-relaxed">
                                <ShieldCheck className="w-3 h-3 inline mr-1 mb-0.5" />
                                Anti-Default: Bond released after final round.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => bids.length > 0 && setShowSatisfaction(true)}
                        disabled={bids.length === 0 || !isAuctionStarted}
                        className="secondary-button w-full py-4 text-sm uppercase tracking-widest font-black disabled:opacity-40"
                    >
                        Trigger Settle Phase
                    </button>
                </div>
            </div>

            {/* Satisfaction Modal */}
            {showSatisfaction && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="glass-card w-full max-w-lg p-10 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-8 h-8 text-blue-900" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 mb-4 text-center">Settle Round {roundNumber}?</h3>
                        <p className="text-slate-500 mb-8 text-center text-lg">
                            Current leader: <span className="text-blue-900 font-bold">${bids[0]?.amount}</span> by{" "}
                            <span className="font-mono text-slate-700">{bids[0]?.bidder?.slice(0, 6)}...{bids[0]?.bidder?.slice(-4)}</span>
                        </p>
                        <div className="grid grid-cols-2 gap-6">
                            <button
                                onClick={() => handleSettle(true)}
                                disabled={isSettling}
                                className="p-6 rounded-2xl border-2 border-emerald-100 bg-emerald-50/30 hover:bg-emerald-50 transition-colors flex flex-col items-center gap-3 disabled:opacity-50"
                            >
                                {isSettling ? <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" /> : <CheckCircle2 className="w-8 h-8 text-emerald-600" />}
                                <span className="font-bold text-emerald-700">Yes, Settle</span>
                            </button>
                            <button
                                onClick={() => handleSettle(false)}
                                disabled={isSettling}
                                className="p-6 rounded-2xl border-2 border-rose-100 bg-rose-50/30 hover:bg-rose-50 transition-colors flex flex-col items-center gap-3"
                            >
                                <XCircle className="w-8 h-8 text-rose-600" />
                                <span className="font-bold text-rose-700">No, Continue</span>
                            </button>
                        </div>
                        <p className="mt-8 text-xs text-slate-400 text-center font-bold uppercase tracking-widest">
                            Settling archives all bids to history and starts a new round.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
