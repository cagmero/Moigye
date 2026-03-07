"use client";

import React from "react";
import { ShieldCheck, ShieldAlert, Shield } from "lucide-react";

export type SBTStatus = "Active" | "Trusted" | "Defaulted";

interface SBTBadgeProps {
    status: SBTStatus;
    className?: string;
}

export default function SBTBadge({ status, className = "" }: SBTBadgeProps) {
    const configs = {
        Trusted: {
            icon: <ShieldCheck className="w-3 h-3" />,
            text: "Trusted Member",
            style: "bg-emerald-50 text-emerald-600 border-emerald-100",
        },
        Defaulted: {
            icon: <ShieldAlert className="w-3 h-3" />,
            text: "Defaulted",
            style: "bg-rose-50 text-rose-600 border-rose-100",
        },
        Active: {
            icon: <Shield className="w-3 h-3" />,
            text: "Active",
            style: "bg-slate-50 text-slate-500 border-slate-100",
        },
    };

    const config = configs[status] || configs.Active;

    return (
        <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${config.style} ${className}`}
        >
            {config.icon}
            {config.text}
        </div>
    );
}
