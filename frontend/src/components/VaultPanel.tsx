"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Vault, ChevronDown, ChevronUp, Loader2, Check, AlertCircle, ArrowDownToLine, Gift } from "lucide-react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { MOIGYE_USD_CONTRACT, MOIGYE_VAULT_CONTRACT } from "@/lib/contracts";

const MUSD_DECIMALS = 6;

interface VaultPanelProps {
    groupId: bigint;
    fixedDeposit: bigint; // in token units (already 6-decimal)
}

type Step = "idle" | "approving" | "approved" | "depositing" | "done" | "error";

export default function VaultPanel({ groupId, fixedDeposit }: VaultPanelProps) {
    const { address } = useAccount();
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<Step>("idle");
    const [errorMsg, setErrorMsg] = useState("");

    const vaultAddress = MOIGYE_VAULT_CONTRACT.address;
    // Calculate total required: fixedDeposit contribution + 50% extra for the vault bond
    const contribution = fixedDeposit > 0n ? fixedDeposit : 1000n * 10n ** BigInt(MUSD_DECIMALS);
    const bondExtra = (contribution * 50n) / 100n;
    const depositAmount = contribution + bondExtra;

    // ── On-chain reads ─────────────────────────────────────────────────────
    const { data: musdBalance, refetch: refetchBalance } = useReadContract({
        ...MOIGYE_USD_CONTRACT,
        functionName: "balanceOf",
        args: address ? [address] : undefined,
        query: { enabled: !!address },
    });

    const { data: allowanceRaw, refetch: refetchAllowance } = useReadContract({
        ...MOIGYE_USD_CONTRACT,
        functionName: "allowance",
        args: address && vaultAddress ? [address, vaultAddress] : undefined,
        query: { enabled: !!address && !!vaultAddress },
    });

    const { data: bondRaw, refetch: refetchBond } = useReadContract({
        ...MOIGYE_VAULT_CONTRACT,
        functionName: "lockedBonds",
        args: [groupId, address as `0x${string}`],
        query: { enabled: !!address },
    });

    const balance = musdBalance ? Number(musdBalance) / 10 ** MUSD_DECIMALS : 0;
    const allowance = allowanceRaw ? BigInt(allowanceRaw as bigint) : 0n;
    const bond = bondRaw ? Number(bondRaw) / 10 ** MUSD_DECIMALS : 0;
    const hasEnoughAllowance = allowance >= depositAmount;
    const hasEnoughBalance = musdBalance ? (musdBalance as bigint) >= depositAmount : false;

    // ── Write contracts ────────────────────────────────────────────────────
    const { writeContract: approve, data: approveHash, isPending: isApproving, error: approveError } = useWriteContract();
    const { writeContract: deposit, data: depositHash, isPending: isDepositing, error: depositError } = useWriteContract();
    const { writeContract: claimBond, data: claimHash, isPending: isClaiming } = useWriteContract();

    const { isLoading: awaitingApprove, isSuccess: approveConfirmed } = useWaitForTransactionReceipt({ hash: approveHash });
    const { isLoading: awaitingDeposit, isSuccess: depositConfirmed } = useWaitForTransactionReceipt({ hash: depositHash });
    const { isSuccess: claimConfirmed } = useWaitForTransactionReceipt({ hash: claimHash });

    // ── State machine ──────────────────────────────────────────────────────
    useEffect(() => { if (approveError || depositError) { setStep("error"); setErrorMsg((approveError || depositError)?.message?.split("\n")[0] ?? "Unknown error"); } }, [approveError, depositError]);
    useEffect(() => { if (approveConfirmed) { refetchAllowance(); setStep("approved"); } }, [approveConfirmed, refetchAllowance]);
    useEffect(() => { if (depositConfirmed) { refetchBalance(); refetchBond(); setStep("done"); } }, [depositConfirmed, refetchBalance, refetchBond]);
    useEffect(() => { if (claimConfirmed) refetchBond(); }, [claimConfirmed, refetchBond]);

    const handleApprove = () => {
        setStep("approving");
        approve({ ...MOIGYE_USD_CONTRACT, functionName: "approve", args: [vaultAddress, depositAmount], gas: BigInt(80_000) });
    };

    const handleDeposit = () => {
        setStep("depositing");
        deposit({ ...MOIGYE_VAULT_CONTRACT, functionName: "depositContribution", args: [depositAmount, groupId], gas: BigInt(150_000) });
    };

    const handleClaimBond = () => {
        claimBond({ ...MOIGYE_VAULT_CONTRACT, functionName: "claimBond", args: [groupId], gas: BigInt(150_000) });
    };

    if (!address) return null;

    const depositFormatted = (Number(depositAmount) / 10 ** MUSD_DECIMALS).toLocaleString();

    return (
        <div className="bg-white border border-slate-200/60 rounded-[2.5rem] overflow-hidden shadow-sm">
            {/* Header — always visible */}
            <button
                onClick={() => setOpen(v => !v)}
                className="w-full px-8 py-5 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-900 rounded-2xl text-white">
                        <Vault className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">MoigyeVault</p>
                        <p className="font-black text-slate-900">
                            Deposit {depositFormatted} mUSD
                            {step === "done" && <span className="ml-2 text-emerald-600 text-xs">✓ Deposited</span>}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-blue-600">{balance.toLocaleString(undefined, { maximumFractionDigits: 2 })} mUSD</span>
                    {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
            </button>

            {/* Expandable body */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                    >
                        <div className="px-8 pb-8 space-y-6 border-t border-slate-100">
                            {/* Stats row */}
                            <div className="grid grid-cols-3 gap-4 pt-6">
                                {[
                                    { label: "Your mUSD Balance", value: `${balance.toLocaleString(undefined, { maximumFractionDigits: 2 })} mUSD` },
                                    { label: "Deposit (Contribution + Bond)", value: `${depositFormatted} mUSD` },
                                    { label: "Locked Bond (Post-Win)", value: bond > 0 ? `${bond.toLocaleString()} mUSD` : "—" },
                                ].map(stat => (
                                    <div key={stat.label} className="bg-slate-50 rounded-2xl p-4 space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                                        <p className="text-base font-black text-slate-900">{stat.value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Error message */}
                            {step === "error" && (
                                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl">
                                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                                    <p className="text-xs font-medium text-red-700">{errorMsg}</p>
                                </div>
                            )}

                            {/* Insufficient balance warning */}
                            {!hasEnoughBalance && step !== "done" && (
                                <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                                    <p className="text-xs font-medium text-amber-700">
                                        Insufficient mUSD balance. You need {depositFormatted} mUSD but only have {balance.toLocaleString(undefined, { maximumFractionDigits: 2 })} mUSD.
                                    </p>
                                </div>
                            )}

                            {/* Two-step flow */}
                            {step !== "done" && (
                                <div className="flex gap-3">
                                    {/* Step 1: Approve */}
                                    <motion.button
                                        whileHover={!hasEnoughAllowance ? { scale: 1.02 } : {}}
                                        whileTap={!hasEnoughAllowance ? { scale: 0.98 } : {}}
                                        onClick={!hasEnoughAllowance ? handleApprove : undefined}
                                        disabled={hasEnoughAllowance || isApproving || awaitingApprove || !hasEnoughBalance}
                                        className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm transition-all
                                            ${hasEnoughAllowance
                                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100 cursor-default"
                                                : "bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-50"
                                            }`}
                                    >
                                        {(isApproving || awaitingApprove)
                                            ? <><Loader2 className="w-4 h-4 animate-spin" />{awaitingApprove ? "Confirming..." : "Signing..."}</>
                                            : hasEnoughAllowance
                                                ? <><Check className="w-4 h-4" /> Approved</>
                                                : <>1. Approve {depositFormatted} mUSD</>
                                        }
                                    </motion.button>

                                    {/* Step 2: Deposit */}
                                    <motion.button
                                        whileHover={hasEnoughAllowance ? { scale: 1.02 } : {}}
                                        whileTap={hasEnoughAllowance ? { scale: 0.98 } : {}}
                                        onClick={hasEnoughAllowance ? handleDeposit : undefined}
                                        disabled={!hasEnoughAllowance || isDepositing || awaitingDeposit || !hasEnoughBalance}
                                        className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm transition-all
                                            ${!hasEnoughAllowance
                                                ? "bg-slate-50 text-slate-300 cursor-not-allowed"
                                                : "bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                                            }`}
                                    >
                                        {(isDepositing || awaitingDeposit)
                                            ? <><Loader2 className="w-4 h-4 animate-spin" />{awaitingDeposit ? "Confirming..." : "Signing..."}</>
                                            : <><ArrowDownToLine className="w-4 h-4" /> 2. Deposit to Vault</>
                                        }
                                    </motion.button>
                                </div>
                            )}

                            {/* Success state */}
                            {step === "done" && (
                                <div className="flex items-center justify-center gap-3 py-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                                    <Check className="w-5 h-5 text-emerald-600" />
                                    <div>
                                        <p className="font-black text-emerald-700 text-sm">Contribution deposited successfully!</p>
                                        <p className="text-xs text-emerald-600">Tx confirmed on-chain. Your funds are in the vault.</p>
                                    </div>
                                </div>
                            )}

                            {/* Claim Bond (if any) */}
                            {bond > 0 && (
                                <motion.button
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    onClick={handleClaimBond}
                                    disabled={isClaiming}
                                    className="w-full flex items-center justify-center gap-2 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black transition-colors disabled:opacity-60"
                                >
                                    {isClaiming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
                                    Claim Locked Bond ({bond.toLocaleString()} mUSD)
                                </motion.button>
                            )}

                            <p className="text-[10px] text-slate-400 text-center font-medium">
                                Vault: {MOIGYE_VAULT_CONTRACT.address}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
