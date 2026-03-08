"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    Shield, Zap, Users, TrendingUp, Lock, Globe, ArrowRight,
    BookOpen, ChevronDown, ExternalLink, Layers, Cpu, BarChart3
} from "lucide-react";
import Link from "next/link";

const Section = ({ id, children }: { id: string; children: React.ReactNode }) => (
    <section id={id} className="scroll-mt-24">{children}</section>
);

const TOC_ITEMS = [
    { id: "abstract", label: "Abstract" },
    { id: "problem", label: "1. The Problem" },
    { id: "solution", label: "2. Moigye Protocol" },
    { id: "architecture", label: "3. Architecture" },
    { id: "scoring", label: "4. Sybil Resistance & Scoring" },
    { id: "bidding", label: "5. Bidding Mechanism" },
    { id: "crosschain", label: "6. Cross-Chain Layer" },
    { id: "yield", label: "7. Yield Strategy" },
    { id: "tokenomics", label: "8. Tokenomics" },
    { id: "roadmap", label: "9. Roadmap" },
];

export default function WhitepaperPage() {
    const [activeSection, setActiveSection] = useState("abstract");

    return (
        <div className="min-h-screen bg-[#FAFAFA] pt-20">
            {/* Hero */}
            <div className="relative bg-slate-900 overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px]" />
                </div>
                <div className="relative max-w-4xl mx-auto px-6 py-24 text-center space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm"
                    >
                        <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Technical Whitepaper · v1.0</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black text-white tracking-tight"
                    >
                        Moigye Protocol
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-slate-400 font-medium max-w-2xl mx-auto"
                    >
                        A Decentralised Rotating Savings &amp; Credit Association (ROSCA) Protocol with Cross-Chain Proof Verification and AI-Driven Yield
                    </motion.p>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-sm text-slate-500"
                    >
                        March 2026 · Creditcoin Testnet (Hub) · Ethereum Sepolia (Spoke)
                    </motion.p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-16 flex gap-12">
                {/* Sticky TOC */}
                <aside className="hidden lg:block w-64 flex-shrink-0">
                    <div className="sticky top-28 space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4 pb-3">Contents</p>
                        {TOC_ITEMS.map((item) => (
                            <a
                                key={item.id}
                                href={`#${item.id}`}
                                onClick={() => setActiveSection(item.id)}
                                className={`block px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeSection === item.id
                                        ? "bg-slate-900 text-white"
                                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                                    }`}
                            >
                                {item.label}
                            </a>
                        ))}
                        <div className="pt-6 px-4">
                            <Link href="/lobby">
                                <button className="w-full premium-button py-3 text-sm flex items-center justify-center gap-2">
                                    Launch App <ArrowRight className="w-4 h-4" />
                                </button>
                            </Link>
                        </div>
                    </div>
                </aside>

                {/* Content */}
                <main className="flex-1 min-w-0 space-y-20 pb-32">
                    {/* Abstract */}
                    <Section id="abstract">
                        <div className="p-10 bg-blue-50/50 border border-blue-100 rounded-[2rem] space-y-4">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                <BookOpen className="w-6 h-6 text-blue-600" /> Abstract
                            </h2>
                            <p className="text-slate-600 leading-relaxed text-lg">
                                Moigye is a fully on-chain implementation of the ROSCA (Rotating Savings and Credit Association) model — known as <em>Gye</em> in Korean culture — built on the Creditcoin Network. It enables groups of users to pool funds, bid competitively for the collective pot each round, and verify cross-chain contributions via Creditcoin&apos;s Universal Smart Contract (USC) precompile. Sybil resistance is enforced through on-chain reputation scoring. An autonomous Chainlink CRE agent optimises idle capital for yield.
                            </p>
                            <p className="text-slate-600 leading-relaxed text-lg">
                                The resulting system is trustless, permissionless, and composable — removing the need for a central administrator while preserving the social trust model that makes ROSCAs effective in practice.
                            </p>
                        </div>
                    </Section>

                    {/* Problem */}
                    <Section id="problem">
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Section 1</span>
                                <h2 className="text-4xl font-black text-slate-900 tracking-tight">The Problem</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { icon: Users, title: "Trust Dependency", desc: "Traditional ROSCAs rely entirely on social trust and a central organiser to enforce contribution rules, creating a single point of failure." },
                                    { icon: Globe, title: "No Cross-Chain Visibility", desc: "Members holding assets on multiple chains cannot prove contributions without a trusted bridge or oracle, introducing custodial risk." },
                                    { icon: Shield, title: "Sybil Vulnerability", desc: "Without identity verification, bad actors can create multiple wallets to dominate group allocation rounds." },
                                    { icon: TrendingUp, title: "Idle Capital", desc: "Pooled funds sitting in a contract between rounds earn no yield, representing a direct opportunity cost for all participants." },
                                ].map(({ icon: Icon, title, desc }) => (
                                    <div key={title} className="p-6 bg-white border border-slate-200 rounded-[1.5rem] space-y-3 shadow-sm">
                                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-lg font-black text-slate-900">{title}</h3>
                                        <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Section>

                    {/* Solution */}
                    <Section id="solution">
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Section 2</span>
                                <h2 className="text-4xl font-black text-slate-900 tracking-tight">The Moigye Protocol</h2>
                            </div>
                            <p className="text-slate-600 leading-relaxed text-lg">
                                Moigye replaces the traditional ROSCA organiser with an ensemble of smart contracts deployed across two chains. The Creditcoin Network serves as the <strong>hub chain</strong> — hosting the core auction logic, reputation system, and group management. Ethereum Sepolia acts as the <strong>spoke chain</strong> — where members make USDC contributions that are cryptographically proven back to the hub without bridging.
                            </p>
                            <div className="p-8 bg-slate-900 rounded-[2rem] text-white space-y-6">
                                <h3 className="text-xl font-black">Core Invariants</h3>
                                <div className="space-y-4">
                                    {[
                                        "Each round, exactly one member receives the full pot.",
                                        "Only members who have deposited can bid. Non-depositors are automatically excluded.",
                                        "A member who has already won cannot win again in the same cycle.",
                                        "The highest-discount bid wins — aligning incentives toward competitive, fair pricing of liquidity.",
                                        "All group membership and auction state is immutably recorded on Creditcoin EVM.",
                                    ].map((inv, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</div>
                                            <p className="text-slate-300 text-sm leading-relaxed">{inv}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* Architecture */}
                    <Section id="architecture">
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Section 3</span>
                                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Architecture</h2>
                            </div>
                            <div className="space-y-4">
                                {[
                                    {
                                        name: "GyeManager.sol",
                                        chain: "Creditcoin Testnet",
                                        desc: "The orchestration contract. Manages group lifecycle — creation, membership, auction kickoff. Verifies caller reputation via ScoreManager before admitting members.",
                                        color: "blue",
                                    },
                                    {
                                        name: "BiddingEngine.sol",
                                        chain: "Creditcoin Testnet",
                                        desc: "Implements the Nak-chal-gye auction phases: Idle → Deposit → BiddingR1 → Voting → FinalChallenge → Completed. Handles bid submission, winner selection, and payout logic.",
                                        color: "indigo",
                                    },
                                    {
                                        name: "ScoreManager.sol",
                                        chain: "Creditcoin Testnet",
                                        desc: "Maintains a reputation score (0–1000) per wallet. Scores are increased on successful participation and slashed on defaults. Used to gate access to higher-value circles.",
                                        color: "emerald",
                                    },
                                    {
                                        name: "MoigyeVault.sol + MoigyeUSD.sol",
                                        chain: "Ethereum Sepolia",
                                        desc: "Spoke-chain contracts where members deposit USDC. MoigyeVault emits Deposit events. MoigyeUSD is a stable token representing vault shares. Both are proven back to the hub via USC.",
                                        color: "violet",
                                    },
                                    {
                                        name: "GyeStaking.sol",
                                        chain: "Creditcoin Testnet",
                                        desc: "Protocol staking module. Stakers earn a share of protocol fees generated from bid discounts. Provides long-term alignment for protocol participants.",
                                        color: "amber",
                                    },
                                ].map((c) => (
                                    <div key={c.name} className="p-6 bg-white border border-slate-200 rounded-[1.5rem] flex gap-6 shadow-sm">
                                        <div className={`px-3 py-1 rounded-lg text-xs font-black self-start bg-${c.color}-50 text-${c.color}-700 border border-${c.color}-100 whitespace-nowrap`}>{c.chain}</div>
                                        <div className="space-y-2">
                                            <code className="text-sm font-black text-slate-900">{c.name}</code>
                                            <p className="text-slate-500 text-sm leading-relaxed">{c.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Section>

                    {/* Scoring */}
                    <Section id="scoring">
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Section 4</span>
                                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Sybil Resistance &amp; Scoring</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { range: "0 – 299", label: "Restricted", desc: "New wallets. Can only join low-deposit circles (<$500). Cannot moderate." },
                                    { range: "300 – 599", label: "Standard", desc: "Active members. Access to most public circles up to $2,000 fixed deposit." },
                                    { range: "600 – 1000", label: "Trusted", desc: "Veteran participants. Unrestricted access. Lower bond requirements." },
                                ].map((tier) => (
                                    <div key={tier.range} className="p-6 bg-white border border-slate-200 rounded-[1.5rem] space-y-3">
                                        <code className="text-2xl font-black text-slate-900">{tier.range}</code>
                                        <p className="text-xs font-black uppercase tracking-widest text-blue-600">{tier.label}</p>
                                        <p className="text-sm text-slate-500 leading-relaxed">{tier.desc}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="p-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] space-y-3">
                                <h3 className="font-black text-slate-900">Score Events</h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex justify-between"><span className="text-slate-600">On-time contribution</span><span className="font-black text-emerald-600">+10</span></div>
                                    <div className="flex justify-between"><span className="text-slate-600">Join a public circle</span><span className="font-black text-emerald-600">+10</span></div>
                                    <div className="flex justify-between"><span className="text-slate-600">Complete a full ROSCA cycle</span><span className="font-black text-emerald-600">+25</span></div>
                                    <div className="flex justify-between"><span className="text-slate-600">Default on contribution</span><span className="font-black text-red-600">−150</span></div>
                                    <div className="flex justify-between"><span className="text-slate-600">Score drops to 0</span><span className="font-black text-red-600">Banned</span></div>
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* Bidding */}
                    <Section id="bidding">
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Section 5</span>
                                <h2 className="text-4xl font-black text-slate-900 tracking-tight">The Bidding Mechanism (Nak-chal-gye)</h2>
                            </div>
                            <p className="text-slate-600 leading-relaxed text-lg">
                                Moigye adapts the Korean <em>nak-chal-gye</em> model — a competitive bidding variant of Gye where each round, the member willing to accept the largest discount on the pot wins the payout. The discount amount stays in the pool, benefiting all remaining members.
                            </p>
                            <div className="space-y-3">
                                {[
                                    { phase: "Idle", desc: "Group created on-chain. Members joining and depositing fixed contributions." },
                                    { phase: "Deposit Window", desc: "Moderator opens the deposit window. Members must deposit their fixed contribution to be eligible to bid." },
                                    { phase: "Active Bidding (R1)", desc: "Members submit blind discount bids. The highest discount bid wins. Minimum bid is 0 (no discount). Maximum is the pot size." },
                                    { phase: "Voting", desc: "Members vote to accept or challenge the result. A 60% satisfaction threshold is required to proceed." },
                                    { phase: "Final Challenge", desc: "If voting fails, a final challenge round is held. The second-highest bidder can take the pot at their terms." },
                                    { phase: "Completed", desc: "Winner receives pot minus their discount. Discount is distributed proportionally to remaining members. Winner's hasWon flag is set." },
                                ].map((p, i) => (
                                    <div key={p.phase} className="flex gap-6 items-start">
                                        <div className="flex flex-col items-center">
                                            <div className="w-8 h-8 rounded-full bg-slate-900 text-white text-xs font-black flex items-center justify-center flex-shrink-0">{i}</div>
                                            {i < 5 && <div className="w-px h-8 bg-slate-200 mt-1" />}
                                        </div>
                                        <div className="pb-4">
                                            <p className="font-black text-slate-900">{p.phase}</p>
                                            <p className="text-sm text-slate-500 leading-relaxed mt-1">{p.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Section>

                    {/* Cross-chain */}
                    <Section id="crosschain">
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Section 6</span>
                                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Cross-Chain Proof Layer</h2>
                            </div>
                            <p className="text-slate-600 leading-relaxed text-lg">
                                Contributions happen on Ethereum Sepolia (cheaper, liquid USDC) but group membership and auctions are managed on Creditcoin. The two chains are connected by Creditcoin&apos;s native Universal Smart Contract (USC) precompile at <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm font-mono">0x0FD2</code>.
                            </p>
                            <div className="p-8 bg-white border border-slate-200 rounded-[2rem] space-y-6 shadow-sm">
                                <h3 className="font-black text-slate-900 text-lg">Proof Flow</h3>
                                {[
                                    "Member calls MoigyeVault.deposit(amount) on Sepolia. A Deposit event is emitted.",
                                    "The bridge daemon (bridge-daemon.ts) detects the event and fetches a Merkle proof from Sepolia's block header.",
                                    "The daemon calls GyeManager.registerContributionFromProof() on Creditcoin with the encoded Ethereum transaction and Merkle proof.",
                                    "GyeManager calls the USC precompile to verify the proof against Sepolia's block headers, which Creditcoin validators attest to natively.",
                                    "On success, the member is marked as having deposited and their score is incremented.",
                                ].map((step, i) => (
                                    <div key={i} className="flex gap-4 items-start text-sm">
                                        <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center flex-shrink-0">{i + 1}</div>
                                        <p className="text-slate-600 leading-relaxed pt-0.5">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Section>

                    {/* Yield */}
                    <Section id="yield">
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Section 7</span>
                                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Yield Strategy</h2>
                            </div>
                            <p className="text-slate-600 leading-relaxed text-lg">
                                Idle vault funds on Sepolia are deployed into yield-bearing protocols (Aave, Compound) by a Chainlink CRE (Custom Runtime Environment) agent. The agent monitors APY across protocols and rotates capital autonomously to maximise returns for all circle members. Yield is distributed pro-rata at the end of each ROSCA cycle.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 bg-white border border-slate-200 rounded-[1.5rem] space-y-3">
                                    <Cpu className="w-8 h-8 text-blue-600" />
                                    <h3 className="font-black text-slate-900">Autonomous Rebalancing</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed">The yield-agent.ts CRE job runs on Chainlink's decentralised compute layer, eliminating the need for a centralised keeper bot.</p>
                                </div>
                                <div className="p-6 bg-white border border-slate-200 rounded-[1.5rem] space-y-3">
                                    <BarChart3 className="w-8 h-8 text-indigo-600" />
                                    <h3 className="font-black text-slate-900">Member Yield Boost</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed">Members receive their principal + proportional yield at cycle end. The yield effectively reduces the real cost of discounting the pot.</p>
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* Tokenomics */}
                    <Section id="tokenomics">
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Section 8</span>
                                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Tokenomics</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200">
                                            <th className="text-left py-3 font-black text-slate-900">Token</th>
                                            <th className="text-left py-3 font-black text-slate-900">Contract</th>
                                            <th className="text-left py-3 font-black text-slate-900">Purpose</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {[
                                            { token: "MoigyeUSD", contract: "MoigyeUSD.sol", purpose: "Stable participation token. 1:1 pegged to USDC. Used for fixed deposits within circles." },
                                            { token: "MoigyeSBT", contract: "MoigyeSBT.sol", purpose: "Soulbound NFT minted on first verified contribution. Non-transferable. Represents protocol membership." },
                                            { token: "Staking Shares", contract: "GyeStaking.sol", purpose: "Protocol stakers earn a share of discount fees from each completed ROSCA round." },
                                        ].map((row) => (
                                            <tr key={row.token}>
                                                <td className="py-4 font-black text-slate-900">{row.token}</td>
                                                <td className="py-4 font-mono text-slate-500 text-xs">{row.contract}</td>
                                                <td className="py-4 text-slate-600">{row.purpose}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </Section>

                    {/* Roadmap */}
                    <Section id="roadmap">
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Section 9</span>
                                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Roadmap</h2>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { phase: "Q1 2026", title: "Testnet Alpha", items: ["Core contracts on Creditcoin testnet", "Cross-chain proof via USC precompile", "Basic frontend with group creation and bidding"] },
                                    { phase: "Q2 2026", title: "Protocol Hardening", items: ["Security audit of all smart contracts", "Bridge daemon redundancy and monitoring", "Reputation score calibration via real usage data"] },
                                    { phase: "Q3 2026", title: "Mainnet Launch", items: ["Creditcoin mainnet deployment", "Ethereum mainnet spoke with real USDC", "Chainlink CRE yield agent activation"] },
                                    { phase: "Q4 2026", title: "Ecosystem Expansion", items: ["Additional spoke chains (Polygon, Base)", "Mobile application", "Protocol grants programme for community circles"] },
                                ].map((milestone, i) => (
                                    <div key={milestone.phase} className="flex gap-6">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 ${i === 0 ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>{i === 0 ? "✓" : i + 1}</div>
                                            {i < 3 && <div className="w-px flex-1 bg-slate-200 my-2" />}
                                        </div>
                                        <div className="pb-8 space-y-2">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-black text-blue-600 uppercase tracking-widest">{milestone.phase}</span>
                                                {i === 0 && <span className="px-2 py-0.5 text-[10px] font-black bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">In Progress</span>}
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900">{milestone.title}</h3>
                                            <ul className="space-y-1">
                                                {milestone.items.map((item) => (
                                                    <li key={item} className="text-sm text-slate-500 flex items-center gap-2">
                                                        <span className="w-1 h-1 rounded-full bg-slate-300 flex-shrink-0" />
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Section>

                    {/* CTA */}
                    <div className="p-10 bg-slate-900 rounded-[2.5rem] text-center space-y-6">
                        <h2 className="text-3xl font-black text-white tracking-tight">Ready to participate?</h2>
                        <p className="text-slate-400">Join a circle on Creditcoin testnet today.</p>
                        <div className="flex justify-center gap-4">
                            <Link href="/lobby">
                                <button className="premium-button flex items-center gap-2">
                                    Launch App <ArrowRight className="w-4 h-4" />
                                </button>
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
