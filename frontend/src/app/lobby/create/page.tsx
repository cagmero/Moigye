"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Globe, Shield, ArrowRight, Loader2 } from "lucide-react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";

export default function CreatePage() {
    const router = useRouter();
    const { address } = useAccount();
    const [isPublic, setIsPublic] = useState(true);
    const [deposit, setDeposit] = useState("1000");
    const [maxParticipants, setMaxParticipants] = useState("10");
    const [biddingDate, setBiddingDate] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateGroup = async () => {
        if (!deposit || !maxParticipants || !biddingDate || !address) return;
        
        setIsCreating(true);
        try {
            // Get next group ID
            const { data: groups } = await supabase
                .from("groups")
                .select("group_id")
                .order("group_id", { ascending: false })
                .limit(1);
            
            const nextId = groups && groups.length > 0 ? groups[0].group_id + 1 : 0;

            // Create group instantly in Supabase
            const { error: groupError } = await supabase
                .from("groups")
                .insert({
                    group_id: nextId,
                    moderator: address.toLowerCase(),
                    fixed_deposit: Number(deposit),
                    max_participants: Number(maxParticipants),
                    is_public: isPublic,
                    min_score_required: 0,
                    is_auction_started: false,
                    phase: 0,
                    current_round: 1,
                });

            if (groupError) throw groupError;

            // Add moderator as first member
            await supabase.from("group_members").insert({
                group_id: nextId,
                wallet_address: address.toLowerCase(),
            });

            console.log("✅ Group created instantly:", nextId);
            router.push("/circles");
        } catch (error) {
            console.error("Create error:", error);
            alert("Failed to create group");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-6 py-20 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button
                onClick={() => router.push("/lobby")}
                className="group flex items-center gap-2 text-sm font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest"
            >
                <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                Back to Lobby
            </button>

            <div className="glass-morphism p-12 rounded-[3rem] space-y-10 border border-white/40 shadow-premium">
                <div className="flex justify-between items-center">
                    <div className="space-y-1">
                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">New Gye Group</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Creditcoin Network Setup</p>
                    </div>
                    <div
                        onClick={() => setIsPublic(!isPublic)}
                        className={`w-16 h-8 rounded-full cursor-pointer transition-colors relative flex items-center ${isPublic ? "bg-blue-600" : "bg-slate-300"}`}
                    >
                        <motion.div animate={{ x: isPublic ? 34 : 4 }} className="w-6 h-6 bg-white rounded-full shadow-lg" />
                    </div>
                </div>

                <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100/50 flex items-center gap-5">
                    {isPublic ? (
                        <>
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><Globe className="w-6 h-6" /></div>
                            <div>
                                <p className="text-sm font-black text-slate-900 uppercase tracking-wider">Public visibility</p>
                                <p className="text-xs text-slate-500 font-medium">Anyone can discover and join this group instantly.</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white"><Shield className="w-6 h-6" /></div>
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
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Fixed Deposit (MoigyeUSD)</label>
                            <input type="number" value={deposit} onChange={(e) => setDeposit(e.target.value)} placeholder="1000"
                                className="w-full p-6 bg-white border border-slate-200 rounded-3xl outline-none focus:border-slate-900 focus:shadow-premium transition-all font-black text-xl" />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Max Participants</label>
                            <input type="number" value={maxParticipants} onChange={(e) => setMaxParticipants(e.target.value)} placeholder="10"
                                className="w-full p-6 bg-white border border-slate-200 rounded-3xl outline-none focus:border-slate-900 focus:shadow-premium transition-all font-black text-xl" />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Initial Bidding Date</label>
                        <input type="datetime-local" value={biddingDate} onChange={(e) => setBiddingDate(e.target.value)}
                            className="w-full p-6 bg-white border border-slate-200 rounded-3xl outline-none focus:border-slate-900 focus:shadow-premium transition-all font-black text-xl" />
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isCreating || !address}
                    onClick={handleCreateGroup}
                    className="premium-button w-full py-6 text-xl flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    {isCreating && <Loader2 className="w-6 h-6 animate-spin" />}
                    {isCreating ? "Creating..." : "Create Circle Instantly"}
                </motion.button>
            </div>
        </div>
    );
}
