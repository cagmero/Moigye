"use client";

import React, { useState, useEffect } from "react";
import { Shield, User, CheckCircle2, XCircle, ArrowRight, Loader2, Play } from "lucide-react";
import { motion } from "framer-motion";
import { useAccount, useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { GYE_MANAGER_CONTRACT } from "@/lib/contracts";
import { supabase } from "@/utils/supabaseClient";

export default function ModeratorPanel({ onBack }: { onBack: () => void }) {
    const { address } = useAccount();

    // 1. Fetch all groups to find ones moderated by this address
    const { data: nextGroupId } = useReadContract({
        ...GYE_MANAGER_CONTRACT,
        functionName: "nextGroupId",
    });

    const groupIds = Array.from({ length: Number(nextGroupId || 0) }, (_, i) => BigInt(i));

    const { data: groupsData, refetch: refetchGroups } = useReadContracts({
        contracts: groupIds.flatMap((id) => [
            { ...GYE_MANAGER_CONTRACT, functionName: "groups", args: [id] },
            { ...GYE_MANAGER_CONTRACT, functionName: "getPendingRequests", args: [id] }
        ]),
    });

    // 2. Contract Mutations
    const { writeContract, data: hash, isPending: isMutating } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    // 3. Track which group is being started (for Supabase sync)
    const [startingGroupId, setStartingGroupId] = useState<bigint | null>(null);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        if (isConfirmed) {
            refetchGroups();
            // Sync auction start to Supabase so LiveArena unlocks for members
            if (startingGroupId !== null) {
                const syncToSupabase = async () => {
                    setSyncing(true);
                    const gId = Number(startingGroupId);

                    // Upsert group row, set auction started
                    const { error } = await supabase
                        .from("groups")
                        .upsert(
                            {
                                group_id: gId,
                                moderator: address?.toLowerCase() || "",
                                is_auction_started: true,
                            },
                            { onConflict: "group_id" }
                        );

                    if (error) console.error("Supabase sync error:", error);
                    setSyncing(false);
                    setStartingGroupId(null);
                };
                syncToSupabase();
            }
        }
    }, [isConfirmed, refetchGroups, startingGroupId, address]);

    const handleAction = (groupId: bigint, user: string, action: "approve" | "decline") => {
        writeContract({
            ...GYE_MANAGER_CONTRACT,
            functionName: action === "approve" ? "approveRequest" : "declineRequest",
            args: [groupId, user as `0x${string}`],
        });
    };

    const handleStartAuction = (groupId: bigint) => {
        setStartingGroupId(groupId);
        writeContract({
            ...GYE_MANAGER_CONTRACT,
            functionName: "startAuction",
            args: [groupId],
        });
    };

    // Parse moderated groups
    const moderatedGroups: any[] = [];
    if (groupsData) {
        for (let i = 0; i < groupIds.length; i++) {
            const groupRes = groupsData[i * 2];
            const requestsRes = groupsData[i * 2 + 1];

            if (groupRes.status === "success" && requestsRes.status === "success") {
                const [groupId, moderator, fixedDeposit, maxParticipants, biddingDate, isPublic, isCircleActive, started] =
                    (groupRes.result as any) as [bigint, `0x${string}`, bigint, bigint, bigint, boolean, boolean, boolean];

                if (moderator === address) {
                    moderatedGroups.push({
                        id: groupId,
                        fixedDeposit,
                        maxParticipants,
                        biddingDate,
                        isPublic,
                        isCircleActive,
                        started,
                        pendingRequests: (requestsRes.result as unknown) as readonly string[],
                    });
                }
            }
        }
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-slate-900 rounded-[1.5rem] text-white shadow-xl shadow-slate-900/20">
                        <Shield className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Moderator Hub</h2>
                        <p className="text-slate-500 font-medium">Manage your circles and start bidding rounds.</p>
                    </div>
                </div>
                <button
                    onClick={onBack}
                    className="group flex items-center gap-2 text-xs font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors"
                >
                    <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                    Back to Lobby
                </button>
            </div>

            <div className="grid grid-cols-1 gap-12">
                {moderatedGroups.length === 0 ? (
                    <div className="glass-morphism p-20 text-center space-y-6 opacity-60">
                        <Shield className="w-16 h-16 text-slate-200 mx-auto" />
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-slate-900">No Moderated Groups</h3>
                            <p className="text-slate-500 font-medium">Create a new circle to start managing your own Gye protocol.</p>
                        </div>
                    </div>
                ) : (
                    moderatedGroups.map((group) => (
                        <div key={group.id.toString()} className="glass-morphism p-10 rounded-[3rem] space-y-8 border border-white/40 shadow-premium relative overflow-hidden">
                            {/* Group Header */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-slate-100/50">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">Circle #{group.id.toString()}</h3>
                                        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${group.isPublic ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-500"}`}>
                                            {group.isPublic ? "Public" : "Private"}
                                        </span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-400">Fixed Deposit: ${group.fixedDeposit.toString()} MoigyeUSD</p>
                                </div>

                                {!group.started ? (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleStartAuction(group.id)}
                                        disabled={isMutating || isConfirming || syncing}
                                        className="premium-button flex items-center gap-3 px-8 py-4 bg-emerald-600 shadow-emerald-600/20 disabled:opacity-50"
                                    >
                                        {(isMutating || isConfirming || syncing) && startingGroupId === group.id ? (
                                            <Loader2 className="w-5 h-5 animate-spin fill-current" />
                                        ) : (
                                            <Play className="w-5 h-5 fill-current" />
                                        )}
                                        {syncing && startingGroupId === group.id ? "Syncing..." : "Start Auction Room"}
                                    </motion.button>
                                ) : (
                                    <div className="flex items-center gap-2 px-6 py-4 bg-emerald-50 text-emerald-600 rounded-2xl font-black border border-emerald-100">
                                        <CheckCircle2 className="w-5 h-5" />
                                        Auction Active
                                    </div>
                                )}
                            </div>

                            {/* Pending Requests */}
                            <div className="space-y-6">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-2">Pending Requests ({group.pendingRequests.length})</h4>
                                <div className="space-y-4">
                                    {group.pendingRequests.length === 0 ? (
                                        <p className="text-sm font-medium text-slate-400 italic px-2">No pending join requests for this circle.</p>
                                    ) : (
                                        group.pendingRequests.map((req: string) => (
                                            <div key={req} className="flex items-center justify-between p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 transition-all hover:bg-white hover:shadow-sm">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm">
                                                        <User className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <p className="font-mono font-bold text-slate-900">{req.slice(0, 6)}...{req.slice(-4)}</p>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Application Pending</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => handleAction(group.id, req, "decline")}
                                                        className="p-4 bg-slate-100 text-slate-400 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                                    >
                                                        <XCircle className="w-6 h-6" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(group.id, req, "approve")}
                                                        className="px-8 py-4 bg-slate-900 text-white font-black rounded-2xl hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2"
                                                    >
                                                        <CheckCircle2 className="w-5 h-5" />
                                                        Approve
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {(isConfirming || syncing) && (
                <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-full flex items-center gap-4 shadow-2xl z-50">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                    <span className="text-sm font-black tracking-widest uppercase">
                        {syncing ? "Opening bidding room..." : "Syncing Transaction..."}
                    </span>
                </div>
            )}
        </div>
    );
}
