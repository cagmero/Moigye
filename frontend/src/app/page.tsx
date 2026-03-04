"use client";

import React, { useState } from "react";
import {
  LineChart,
  Wallet,
  Globe,
  TrendingUp,
  ShieldCheck,
  ArrowUpRight,
  Users,
  Calendar,
  Gavel,
  CheckCircle2,
  Plus
} from "lucide-react";
import GroupSetupView from "@/components/GroupSetupView";
import LiveArena from "@/components/LiveArena";

export default function Dashboard() {
  const [view, setView] = useState<"overview" | "setup" | "arena">("overview");
  const [activeGroupId, setActiveGroupId] = useState<number | null>(null);

  const stats = [
    { label: "Credit Score", value: "742", icon: ShieldCheck, color: "text-blue-900" },
    { label: "TVL (Sepolia)", value: "$12,400", icon: Wallet, color: "text-slate-600" },
    { label: "Current Round", value: "4 / 10", icon: Calendar, color: "text-slate-600" },
    { label: "Participants", value: "10", icon: Users, color: "text-slate-600" },
  ];

  const handleCreateGroup = (data: any) => {
    console.log("Creating group:", data);
    setActiveGroupId(1); // Demo ID
    setView("overview");
  };

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto space-y-8 bg-slate-50/50">
      {/* Header */}
      <header className="flex justify-between items-center bg-white/50 p-6 rounded-3xl border border-slate-200/60 backdrop-blur-sm">
        <div onClick={() => setView("overview")} className="cursor-pointer">
          <h1 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
            <Globe className="w-8 h-8" />
            Moigye protocol
          </h1>
          <p className="text-slate-500 font-medium mt-1">Decentralized Cross-Chain ROSCA</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setView("setup")}
            className="secondary-button flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Group
          </button>
          <button className="premium-button">Connect Wallet</button>
        </div>
      </header>

      {view === "setup" ? (
        <GroupSetupView onCreateGroup={handleCreateGroup} />
      ) : view === "arena" ? (
        <LiveArena groupId={activeGroupId || 1} />
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="glass-card p-6 border-b-4 border-b-blue-900/10 hover:translate-y-[-2px] transition-transform">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2.5 rounded-xl bg-slate-50 ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-2xl font-bold mt-1 text-slate-900">{stat.value}</h3>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Pool Card */}
            <div className="lg:col-span-2 glass-card overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Active Pool Overview</h2>
                  <p className="text-slate-500 text-sm mt-1">Verified via Creditcoin Native Proofs</p>
                </div>
                <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100">
                  LIVE ROUND
                </div>
              </div>
              <div className="p-8 space-y-8">
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-bold text-slate-900">$1,000</span>
                  <span className="text-xl font-semibold text-slate-400 mb-1.5">/ Pot Value</span>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm font-bold text-slate-900 mb-2">
                    <span>Round Progress</span>
                    <span>8 / 10 Deposits</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div className="bg-blue-900 h-full w-[80%] rounded-full shadow-lg shadow-blue-900/20" />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    className="premium-button flex-1 py-4 text-lg"
                  >
                    Deposit Contribution
                  </button>
                  <button
                    onClick={() => setView("arena")}
                    className="secondary-button flex-1 py-4 text-lg flex items-center justify-center gap-2"
                  >
                    <Gavel className="w-5 h-5" />
                    Enter Live Arena
                  </button>
                </div>
              </div>
            </div>

            {/* History / Yield Card */}
            <div className="glass-card flex flex-col">
              <div className="p-6 border-b border-slate-100 italic">
                <h2 className="text-lg font-bold text-slate-900">Yield Agent Activity</h2>
                <p className="text-slate-500 text-sm">Autonomous CRE Monitoring</p>
              </div>
              <div className="p-6 flex-1 space-y-6">
                <div className="flex gap-4">
                  <div className="w-1 bg-blue-900/20 rounded-full" />
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-blue-900 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-slate-900">Yield Optimized</p>
                        <p className="text-xs text-slate-500">240 USDC moved to Aave Pool</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <ArrowUpRight className="w-5 h-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-slate-900">New Deposit Verified</p>
                        <p className="text-xs text-slate-500">Hub sync completed via 0x0FD2</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-slate-50/50 rounded-b-2xl border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Protocol V1.0 - Sepolia Hub</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

