"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, ChevronUp, Loader2, Check, Zap } from "lucide-react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { MOIGYE_USD_CONTRACT } from "@/lib/contracts";

const MINT_PRESETS = [
    { label: "10,000 mUSD", amount: "10000" },
    { label: "50,000 mUSD", amount: "50000" },
    { label: "100,000 mUSD", amount: "100000" },
];

export default function MUSDWidget() {
    const { address } = useAccount();
    const [open, setOpen] = useState(false);
    const [mintTarget, setMintTarget] = useState("");
    const [mintingPreset, setMintingPreset] = useState<string | null>(null);
    const ref = useRef<HTMLDivElement>(null);

    // ── Balance of connected wallet ───────────────────────────────
    const { data: balanceRaw, refetch: refetchBalance } = useReadContract({
        ...MOIGYE_USD_CONTRACT,
        functionName: "balanceOf",
        args: address ? [address] : undefined,
        query: { enabled: !!address },
    });

    const { data: decimalsRaw } = useReadContract({
        ...MOIGYE_USD_CONTRACT,
        functionName: "decimals",
    });

    const { data: ownerRaw } = useReadContract({
        ...MOIGYE_USD_CONTRACT,
        functionName: "owner",
    });

    const decimals = Number(decimalsRaw ?? 6);
    const balance = balanceRaw !== undefined
        ? (Number(balanceRaw) / 10 ** decimals).toLocaleString(undefined, { maximumFractionDigits: 2 })
        : "—";
    const isOwner = ownerRaw && address && (ownerRaw as string).toLowerCase() === address.toLowerCase();

    // ── Mint TX ───────────────────────────────────────────────────
    const { writeContract, data: mintHash, isPending: isMinting } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: mintConfirmed } = useWaitForTransactionReceipt({ hash: mintHash });

    useEffect(() => {
        if (mintConfirmed) {
            refetchBalance();
            setMintingPreset(null);
        }
    }, [mintConfirmed, refetchBalance]);

    const handleMint = (amount: string, toAddress: string) => {
        if (!toAddress || isMinting || isConfirming) return;
        setMintingPreset(amount);
        writeContract({
            ...MOIGYE_USD_CONTRACT,
            functionName: "mint",
            args: [toAddress as `0x${string}`, BigInt(Number(amount) * 10 ** decimals)],
            gas: BigInt(120_000),
        });
    };

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    if (!address) return null;

    return (
        <div ref={ref} className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
            {/* Dropdown Panel */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="w-72 bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-[1.75rem] shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-5 py-4 bg-slate-900 text-white space-y-0.5">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">mUSD Balance</p>
                            <p className="text-2xl font-black tracking-tight">{balance} <span className="text-base font-medium text-slate-400">mUSD</span></p>
                            <p className="text-[10px] font-mono text-slate-500 truncate">{address}</p>
                        </div>

                        {/* Mint Section — only shown to contract owner */}
                        {isOwner ? (
                            <div className="p-4 space-y-3">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                                    Mint Tokens <span className="text-amber-500">· Owner Only</span>
                                </p>

                                {/* Custom target address */}
                                <input
                                    type="text"
                                    placeholder="Recipient address (0x…)"
                                    value={mintTarget}
                                    onChange={(e) => setMintTarget(e.target.value)}
                                    className="w-full px-4 py-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-colors"
                                />
                                {/* Quick-fill buttons */}
                                <div className="flex gap-1.5">
                                    <button
                                        onClick={() => setMintTarget(address)}
                                        className="flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                                    >
                                        Self
                                    </button>
                                    <button
                                        onClick={() => setMintTarget("0xA72AE11555AA16aA602A8BD3C89006F75d7738F5")}
                                        className="flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors truncate"
                                    >
                                        Demo Wallet
                                    </button>
                                </div>

                                {/* Preset amounts */}
                                <div className="space-y-1.5">
                                    {MINT_PRESETS.map((preset) => {
                                        const isThisLoading = mintingPreset === preset.amount && (isMinting || isConfirming);
                                        const isThisDone = mintingPreset === preset.amount && mintConfirmed;
                                        return (
                                            <motion.button
                                                key={preset.amount}
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleMint(preset.amount, mintTarget || address)}
                                                disabled={isMinting || isConfirming}
                                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-black text-sm transition-all disabled:opacity-60
                                                    ${isThisDone
                                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                                        : "bg-blue-600 hover:bg-blue-700 text-white"
                                                    }`}
                                            >
                                                <span className="flex items-center gap-2">
                                                    {isThisLoading
                                                        ? <Loader2 className="w-4 h-4 animate-spin" />
                                                        : isThisDone
                                                            ? <Check className="w-4 h-4" />
                                                            : <Zap className="w-4 h-4" />}
                                                    Mint {preset.label}
                                                </span>
                                                {isThisLoading && <span className="text-[10px] opacity-60">{isConfirming ? "Confirming..." : "Signing..."}</span>}
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 text-center space-y-2">
                                <p className="text-sm text-slate-500 font-medium">Only the contract owner can mint mUSD.</p>
                                <p className="text-[10px] font-mono text-slate-400 truncate">{String(ownerRaw)}</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Trigger Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2.5 px-5 py-3 bg-slate-900 text-white rounded-full shadow-2xl shadow-slate-900/30 font-black text-sm border border-white/10 backdrop-blur-sm"
            >
                <div className="relative">
                    <Coins className="w-4 h-4 text-amber-400" />
                    {(isMinting || isConfirming) && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                    )}
                </div>
                <span className="text-amber-400 font-black">{balance}</span>
                <span className="text-slate-400 text-xs">mUSD</span>
                <ChevronUp className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? "" : "rotate-180"}`} />
            </motion.button>
        </div>
    );
}
