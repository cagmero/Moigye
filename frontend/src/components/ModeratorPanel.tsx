"use client";

import React, { useState } from "react";
import { Shield, User, CheckCircle2, XCircle, ArrowRight, Clock } from "lucide-react";

interface Request {
    groupId: number;
    user: string;
    deposit: number;
    timestamp: string;
}

export default function ModeratorPanel({ onBack }: { onBack: () => void }) {
    const [requests, setRequests] = useState<Request[]>([
        { groupId: 105, user: "0x742...dEad", deposit: 1000, timestamp: "2 mins ago" },
        { groupId: 105, user: "0x0FD...2pre", deposit: 1000, timestamp: "15 mins ago" },
        { groupId: 108, user: "0x333...beef", deposit: 250, timestamp: "1 hour ago" },
    ]);

    const handleAction = (user: string, action: 'approve' | 'decline') => {
        setRequests(prev => prev.filter(r => r.user !== user));
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-900 rounded-2xl text-white">
                    <Shield className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Moderator Control</h2>
                    <p className="text-slate-500 font-medium italic">Approve entry for your private Gye groups</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Stats */}
                <div className="space-y-6">
                    <div className="glass-card p-6 space-y-2">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Requests</p>
                        <p className="text-4xl font-black text-blue-900">{requests.length}</p>
                    </div>
                    <div className="glass-card p-6 space-y-2">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Managed Groups</p>
                        <p className="text-4xl font-black text-slate-900">2</p>
                    </div>
                </div>

                {/* Requests List */}
                <div className="lg:col-span-3 space-y-4">
                    {requests.length === 0 ? (
                        <div className="glass-card p-20 text-center space-y-4 opacity-50">
                            <CheckCircle2 className="w-12 h-12 text-blue-900 mx-auto" />
                            <p className="font-bold text-slate-500">All caught up! No pending requests.</p>
                        </div>
                    ) : (
                        requests.map((req, i) => (
                            <div key={i} className="glass-card p-6 flex items-center justify-between border-l-4 border-l-blue-900 hover:bg-white transition-colors">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-mono font-bold text-slate-900">{req.user}</p>
                                            <span className="text-[10px] font-black bg-blue-50 text-blue-900 px-2 py-0.5 rounded uppercase">Group #{req.groupId}</span>
                                        </div>
                                        <div className="flex items-center gap-4 mt-1">
                                            <p className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {req.timestamp}
                                            </p>
                                            <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                                $ {req.deposit} Deposit Ready
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleAction(req.user, 'decline')}
                                        className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors"
                                    >
                                        <XCircle className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={() => handleAction(req.user, 'approve')}
                                        className="px-6 py-3 bg-blue-900 text-white font-black rounded-xl hover:bg-blue-800 transition-all flex items-center gap-2"
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

            <button onClick={onBack} className="text-slate-400 hover:text-slate-900 font-bold flex items-center gap-2 pt-8">
                <ArrowRight className="w-4 h-4 rotate-180" /> Back to Lobby Hub
            </button>
        </div>
    );
}
