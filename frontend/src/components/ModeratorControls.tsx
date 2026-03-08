"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Gavel, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/utils/supabaseClient";

interface ModeratorControlsProps {
    groupId: bigint;
    moderator: string;
    currentPhase: number;
    userAddress?: string;
    onPhaseChange?: () => void;
}

const PHASES = ["Idle", "Deposit Window", "Active Bidding", "Voting", "Final Challenge", "Completed"];

export default function ModeratorControls({ 
    groupId, 
    moderator, 
    currentPhase, 
    userAddress,
    onPhaseChange 
}: ModeratorControlsProps) {
    const [isUpdating, setIsUpdating] = useState(false);
    const isModerator = userAddress?.toLowerCase() === moderator.toLowerCase();

    if (!isModerator) return null;

    const updatePhase = async (newPhase: number) => {
        setIsUpdating(true);
        try {
            const { error } = await supabase.rpc("update_group_phase", {
                p_group_id: Number(groupId),
                p_new_phase: newPhase,
                p_moderator: moderator.toLowerCase(),
            });

            if (error) throw error;
            
            console.log("✅ Phase updated instantly:", PHASES[newPhase]);
            onPhaseChange?.();
        } catch (error) {
            console.error("Phase update error:", error);
            alert("Failed to update phase");
        } finally {
            setIsUpdating(false);
        }
    };

    const finalizeRound = async () => {
        setIsUpdating(true);
        try {
            const { error } = await supabase.rpc("finalize_round", {
                p_group_id: Number(groupId),
                p_round_number: 1, // TODO: get from group
            });

            if (error) throw error;
            
            console.log("✅ Round finalized");
            onPhaseChange?.();
        } catch (error) {
            console.error("Finalize error:", error);
            alert("Failed to finalize round");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="glass-morphism rounded-[2.5rem] p-8 border border-white/40 space-y-4">
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Play className="w-5 h-5 text-blue-600" /> Moderator Controls
            </h2>
            
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-slate-400 px-1">
                <span>Current Phase</span>
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700">
                    {PHASES[currentPhase]}
                </span>
            </div>

            <div className="space-y-3">
                {currentPhase === 0 && (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => updatePhase(1)}
                        disabled={isUpdating}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-2xl transition-colors disabled:opacity-60"
                    >
                        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : "→ Open Deposit Window"}
                    </motion.button>
                )}

                {currentPhase === 1 && (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => updatePhase(2)}
                        disabled={isUpdating}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl transition-colors disabled:opacity-60"
                    >
                        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Play className="w-4 h-4 fill-current" /> Start Bidding</>}
                    </motion.button>
                )}

                {currentPhase === 2 && (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => updatePhase(3)}
                        disabled={isUpdating}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white font-black rounded-2xl transition-colors disabled:opacity-60"
                    >
                        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Stop Bidding & Start Voting"}
                    </motion.button>
                )}

                {currentPhase === 3 && (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={finalizeRound}
                        disabled={isUpdating}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-colors disabled:opacity-60"
                    >
                        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" /> Finalize Round</>}
                    </motion.button>
                )}
            </div>

            <p className="text-xs text-slate-400 font-medium text-center">
                All actions are instant and gas-free
            </p>
        </div>
    );
}
