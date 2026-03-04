"use client";

import React, { useState } from "react";
import { Users, Calendar, DollarSign, PlusCircle } from "lucide-react";

export default function GroupSetupView({ onCreateGroup }: { onCreateGroup: (data: any) => void }) {
    const [members, setMembers] = useState(["", "", ""]);
    const [contribution, setContribution] = useState("100");
    const [biddingTime, setBiddingTime] = useState("");

    const addMember = () => setMembers([...members, ""]);
    const updateMember = (index: number, value: string) => {
        const newMembers = [...members];
        newMembers[index] = value;
        setMembers(newMembers);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCreateGroup({
            members: members.filter(m => m !== ""),
            contribution: parseFloat(contribution),
            biddingTimestamp: Math.floor(new Date(biddingTime).getTime() / 1000)
        });
    };

    return (
        <div className="glass-card p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-50 rounded-2xl text-blue-900">
                    <PlusCircle className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Create Gye Group</h2>
                    <p className="text-slate-500 font-medium">Initialize a new Nak-chal-gye auction cycle</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Member Wallets
                    </label>
                    {members.map((member, i) => (
                        <input
                            key={i}
                            type="text"
                            placeholder={`Wallet Address ${i + 1}`}
                            value={member}
                            onChange={(e) => updateMember(i, e.target.value)}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900 outline-none transition-all font-mono text-sm"
                        />
                    ))}
                    <button
                        type="button"
                        onClick={addMember}
                        className="text-blue-900 font-bold text-sm flex items-center gap-2 hover:opacity-70 transition-opacity"
                    >
                        <PlusCircle className="w-4 h-4" />
                        Add Another Member
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Monthly Contribution (USDC)
                        </label>
                        <input
                            type="number"
                            value={contribution}
                            onChange={(e) => setContribution(e.target.value)}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900 outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Auction Date & Time
                        </label>
                        <input
                            type="datetime-local"
                            value={biddingTime}
                            onChange={(e) => setBiddingTime(e.target.value)}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900 outline-none transition-all"
                        />
                    </div>
                </div>

                <button type="submit" className="premium-button w-full py-4 text-lg mt-4">
                    Establish Protocol Group
                </button>
            </form>
        </div>
    );
}
