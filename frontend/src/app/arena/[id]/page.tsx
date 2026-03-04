"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gavel, Trophy, User, ArrowUpRight, CheckCircle2, XCircle, DollarSign, Clock, TrendingUp } from "lucide-react";

interface Bid {
    id: string;
    bidder: string;
    discount: number;
    timestamp: string;
}

export default function ArenaPage({ params }: { params: { id: string } }) {
    const [bids, setBids] = useState<Bid[]>([
        { id: "1", bidder: "0x742...dEad", discount: 1500, timestamp: "12:05:01" },
        { id: "2", bidder: "0x888...beef", discount: 1450, timestamp: "12:04:30" },
        { id: "3", bidder: "0xabc...123", discount: 1200, timestamp: "12:03:15" },
    ]);
    const [myBid, setMyBid] = useState("");
    const [potSize] = useState(12400);

    // Simulated reordering
    useEffect(() => {
        const timer = setInterval(() => {
            setBids(prev => {
                const sorted = [...prev].sort((a, b) => b.discount - a.discount);
                return sorted;
            });
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    const handlePlaceBid = () => {
        if (!myBid) return;
        const newBid: Bid = {
            id: Math.random().toString(),
            bidder: "You (0x123...456)",
            discount: parseInt(myBid),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        };
        setBids(prev => [newBid, ...prev].sort((a, b) => b.discount - a.discount));
        setMyBid("");
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-12 animate-in fade-in duration-700">
            {/* Top Section: Pot Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-2 relative h-[400px] rounded-[3rem] overflow-hidden shadow-premium border border-slate-200/50"
                >
                    {/* Apple Card Style Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-900 to-indigo-600 opacity-[0.9] z-0" />
                    <div className="absolute inset-0 mesh-gradient opacity-20 z-1" />

                    <div className="relative z-10 p-12 h-full flex flex-col justify-between text-white">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="text-xs font-black uppercase tracking-[0.3em] opacity-60">Live Auction Protocol</p>
                                <h2 className="text-4xl font-black tracking-tight">Group #{params.id} Match</h2>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-full flex items-center gap-3">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                <span className="text-sm font-black tracking-widest uppercase">Round 1 Active</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-xs font-black uppercase tracking-[0.3em] opacity-60">Current Total Pot</p>
                            <div className="flex items-baseline gap-4">
                                <motion.span
                                    className="text-8xl md:text-9xl font-black tracking-tighter"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    ${potSize.toLocaleString()}
                                </motion.span>
                                <div className="flex items-center gap-1 text-emerald-400 font-black mb-4">
                                    <TrendingUp className="w-5 h-5" />
                                    <span>USDC</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-8">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Time Left</p>
                                <div className="flex items-center gap-2 text-xl font-black">
                                    <Clock className="w-5 h-5" />
                                    24:12
                                </div>
                            </div>
                            <div className="w-px h-10 bg-white/20" />
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Highest Discount</p>
                                <p className="text-xl font-black">${bids[0]?.discount || 0}</p>
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
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Your Bid Strategy</h3>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                            Input the discount you are willing to offer the pool. A higher discount increases your win probability but reduces your final checkout.
                        </p>
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-4">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">
                                <span>Discount Amount</span>
                                <span>Max: $2,500</span>
                            </div>
                            <div className="relative">
                                <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300" />
                                <input
                                    type="number"
                                    value={myBid}
                                    onChange={(e) => setMyBid(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full pl-16 pr-8 py-6 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:border-slate-900 focus:shadow-premium transition-all font-black text-3xl"
                                />
                            </div>
                        </div>

                        <div className="p-6 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl space-y-2">
                            <div className="flex justify-between text-xs font-bold">
                                <span className="text-slate-500">Predicted Payout</span>
                                <span className="text-slate-900">${potSize - (parseInt(myBid) || 0)}</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold">
                                <span className="text-slate-500">Group Yield Share</span>
                                <span className="text-indigo-600">~ $45.20 / member</span>
                            </div>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handlePlaceBid}
                        className="w-full premium-button py-6 text-xl tracking-tight bg-slate-900 shadow-xl shadow-slate-900/10"
                    >
                        Submit High-Bid
                    </motion.button>
                </motion.div>
            </div>

            {/* Leaderboard Section */}
            <div className="space-y-8">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Gavel className="w-8 h-8 text-indigo-600" />
                        Bidding Leaderboard
                    </h2>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{bids.length} Active Bids</span>
                </div>

                <div className="glass-morphism rounded-[2.5rem] overflow-hidden">
                    <div className="grid grid-cols-4 px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                        <span className="col-span-1">Rank</span>
                        <span className="col-span-1">Address</span>
                        <span className="col-span-1 text-right">Discount</span>
                        <span className="col-span-1 text-right">Time</span>
                    </div>

                    <div className="p-4">
                        <AnimatePresence initial={false}>
                            {bids.map((bid, index) => (
                                <motion.div
                                    key={bid.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    className={`grid grid-cols-4 px-6 py-5 rounded-2xl items-center mb-1 transition-colors ${index === 0 ? 'bg-indigo-50/50 border border-indigo-100/50' : 'hover:bg-slate-50'}`}
                                >
                                    <div className="col-span-1 flex items-center gap-4">
                                        {index === 0 ? (
                                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-xs">1</div>
                                        ) : (
                                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 font-black text-xs">{index + 1}</div>
                                        )}
                                    </div>
                                    <div className="col-span-1">
                                        <p className="font-mono font-bold text-slate-900 truncate">{bid.bidder}</p>
                                        {bid.bidder.startsWith("You") && <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Your Strategy</span>}
                                    </div>
                                    <div className="col-span-1 text-right">
                                        <p className={`text-xl font-black ${index === 0 ? 'text-indigo-600' : 'text-slate-900'}`}>${bid.discount}</p>
                                    </div>
                                    <div className="col-span-1 text-right">
                                        <p className="text-xs font-bold text-slate-400 tracking-tighter">{bid.timestamp}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
