"use client";

import React, { useState } from "react";
import { Plus, Search, Shield, Globe, Users, DollarSign, Calendar, ArrowRight } from "lucide-react";
import DiscoveryExplorer from "@/components/DiscoveryExplorer";
import ModeratorPanel from "@/components/ModeratorPanel";

export default function LobbyPage() {
    const [view, setView] = useState<"landing" | "create" | "discover" | "moderate">("landing");
    const [isPublic, setIsPublic] = useState(true);

    return (
        <div className="min-h-screen bg-slate-50/50 p-8">
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Hero Section */}
                {view === "landing" && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-700">
                        <div className="text-center space-y-4 pt-12">
                            <h1 className="text-5xl font-black text-slate-900 tracking-tight">
                                Gye <span className="text-blue-900">Lobbies</span>
                            </h1>
                            <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
                                Join public ROSCA pools instantly or create a private group with moderated entry.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
                            {/* Create Card */}
                            <div
                                onClick={() => setView("create")}
                                className="group relative glass-card p-10 cursor-pointer overflow-hidden transition-all hover:translate-y-[-4px] hover:shadow-xl hover:shadow-blue-900/5 border-2 border-transparent hover:border-blue-100"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform">
                                    <Plus className="w-48 h-48 text-blue-900" />
                                </div>
                                <div className="space-y-6 relative z-10">
                                    <div className="w-16 h-16 bg-blue-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
                                        <Plus className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-900 mb-2">Create Group</h2>
                                        <p className="text-slate-500 font-medium text-lg italic">Start your own Gye cycle</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-blue-900 font-bold group-hover:translate-x-2 transition-transform">
                                        Initialize Protocol <ArrowRight className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>

                            {/* Discover Card */}
                            <div
                                onClick={() => setView("discover")}
                                className="group relative glass-card p-10 cursor-pointer overflow-hidden transition-all hover:translate-y-[-4px] hover:shadow-xl hover:shadow-blue-900/5 border-2 border-transparent hover:border-blue-100"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform">
                                    <Search className="w-48 h-48 text-blue-900" />
                                </div>
                                <div className="space-y-6 relative z-10">
                                    <div className="w-16 h-16 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center text-blue-900 shadow-md">
                                        <Search className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-900 mb-2">Discover Groups</h2>
                                        <p className="text-slate-500 font-medium text-lg italic">Explore public matchmaking</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-blue-900 font-bold group-hover:translate-x-2 transition-transform">
                                        View Pools <ArrowRight className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-center pt-8">
                            <button
                                onClick={() => setView("moderate")}
                                className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-900 font-bold tracking-widest uppercase text-xs transition-colors"
                            >
                                <Shield className="w-4 h-4" />
                                Access Moderator Dashboard
                            </button>
                        </div>
                    </div>
                )}

                {/* Create Modal Simulation */}
                {view === "create" && (
                    <div className="max-w-2xl mx-auto space-y-8 animate-in zoom-in-95 duration-300">
                        <button onClick={() => setView("landing")} className="text-slate-400 hover:text-slate-900 font-bold flex items-center gap-2 mb-4">
                            <ArrowRight className="w-4 h-4 rotate-180" /> Back to Lobby
                        </button>

                        <div className="glass-card p-10 space-y-8">
                            <div className="flex justify-between items-center">
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Setup New Group</h2>
                                <div
                                    onClick={() => setIsPublic(!isPublic)}
                                    className={`w-16 h-8 rounded-full cursor-pointer transition-colors relative flex items-center ${isPublic ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                >
                                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform absolute ${isPublic ? 'translate-x-9' : 'translate-x-1'}`} />
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-4">
                                {isPublic ? (
                                    <>
                                        <Globe className="w-6 h-6 text-emerald-500" />
                                        <p className="text-sm font-bold text-slate-600 uppercase tracking-wider">Public: Anyone can join instantly</p>
                                    </>
                                ) : (
                                    <>
                                        <Shield className="w-6 h-6 text-blue-900" />
                                        <p className="text-sm font-bold text-slate-600 uppercase tracking-wider">Private: You must approve requests</p>
                                    </>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                        <DollarSign className="w-3 h-3" /> Fixed Deposit (USDC)
                                    </label>
                                    <input type="number" placeholder="500" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-900 transition-colors" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                        <Users className="w-3 h-3" /> Max Participants
                                    </label>
                                    <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-900 transition-colors appearance-none">
                                        <option>5 Members</option>
                                        <option>10 Members</option>
                                        <option>20 Members</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                    <Calendar className="w-3 h-3" /> Bidding Round Start
                                </label>
                                <input type="datetime-local" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-900 transition-colors" />
                            </div>

                            <button
                                onClick={() => setView("landing")}
                                className="premium-button w-full py-5 text-lg font-black tracking-tight"
                            >
                                Deploy Group Contract
                            </button>
                        </div>
                    </div>
                )}

                {view === "discover" && <DiscoveryExplorer onBack={() => setView("landing")} />}
                {view === "moderate" && <ModeratorPanel onBack={() => setView("landing")} />}
            </div>
        </div>
    );
}
