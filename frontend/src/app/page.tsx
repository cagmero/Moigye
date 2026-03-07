"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Globe,
  Shield,
  Zap,
  Users,
  TrendingUp,
  Layers,
  Lock,
  Cpu
} from "lucide-react";
import Link from "next/link";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 }
  }
} as const;

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] overflow-x-hidden pt-20">
      {/* Background Mesh Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-blue-50/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-indigo-50/40 rounded-full blur-[120px]" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-32">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="text-center space-y-12"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/5 border border-slate-900/10 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Protocol V1.0 Live on Sepolia</p>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-7xl md:text-9xl font-black text-slate-900 tracking-[-0.06em] leading-[0.95]"
          >
            Social Savings.<br />
            <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Redefined.</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-slate-500 font-medium max-w-3xl mx-auto leading-relaxed"
          >
            Moigye brings the age-old tradition of ROSCA (Gye) to the blockchain.
            Harnessing cross-chain proofs and AI-driven yield for trustless community finance.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-6 pt-8">
            <Link href="/lobby">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="premium-button text-lg px-12 py-6 bg-slate-900 text-white shadow-2xl shadow-slate-900/20"
              >
                Join the Lobby
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="secondary-button text-lg px-12 py-6 bg-white border border-slate-200"
            >
              The Whitepaper
            </motion.button>
          </motion.div>
        </motion.div>
      </section>

      {/* Abstract Idea Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-40">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-5xl font-black text-slate-900 tracking-tight leading-tight">
              The Evolution of <br /> Community Support.
            </h2>
            <div className="space-y-6">
              <p className="text-lg text-slate-500 font-medium leading-relaxed">
                Traditional ROSCAs (Rotating Savings and Credit Associations) rely on physical trust.
                Moigye digitizes this social contract using <span className="text-slate-900 font-bold underline decoration-blue-500/30">Creditcoin Native Proofs</span>.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <div className="space-y-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                    <Shield className="w-5 h-5" />
                  </div>
                  <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest">Trustless Gye</h4>
                  <p className="text-sm text-slate-400 font-medium">No centralized custodian. Smart contracts manage the pot and bidding logic.</p>
                </div>
                <div className="space-y-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest">Yield-Boosted</h4>
                  <p className="text-sm text-slate-400 font-medium">Idle funds earn interest via Aave integration, lowering the net cost for members.</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="glass-morphism rounded-[3rem] p-12 aspect-square flex flex-col justify-center border border-slate-200/50 bg-white/50 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl" />
              <div className="relative z-10 space-y-12">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Status</p>
                    <p className="text-4xl font-black text-slate-900 tracking-tighter">Live on Sepolia</p>
                  </div>
                  <Users className="w-12 h-12 text-slate-200" />
                </div>
                <div className="space-y-6">
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "100%" }}
                      transition={{ duration: 2, delay: 0.5 }}
                      className="h-full bg-slate-900"
                    />
                  </div>
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-400">
                    <span>Contracts Deployed</span>
                    <span>Creditcoin + Sepolia</span>
                  </div>
                </div>
                <div className="flex gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex-1 h-16 rounded-2xl bg-slate-50 border border-slate-100" />
                  ))}
                </div>
              </div>
            </div>
            {/* Floating Accents */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-100/50 rounded-full blur-2xl" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-blue-100/50 rounded-full blur-2xl" />
          </motion.div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-32 border-t border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            {
              icon: <Globe className="w-8 h-8" />,
              title: "Cross-Chain Sync",
              desc: "Verify deposits on Spoke vaults and sync to the Sepolia Hub instantly via 0x0FD2 precompiles."
            },
            {
              icon: <Cpu className="w-8 h-8" />,
              title: "AI Yield Agents",
              desc: "Autonomous CRE agents manage pooled collateral, ensuring every dollar earns maximum market returns."
            },
            {
              icon: <Lock className="w-8 h-8" />,
              title: "Reputation Layer",
              desc: "Build your on-chain credit history. Successful Gye rounds unlock lower rates and higher protocol limits."
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="space-y-6 p-8 rounded-[2.5rem] hover:bg-white hover:shadow-premium transition-all duration-500"
            >
              <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-900/20">
                {feature.icon}
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{feature.title}</h3>
                <p className="text-base text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-40 pt-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-slate-900 rounded-[4rem] p-16 md:p-24 text-center space-y-12 relative overflow-hidden"
        >
          <div className="absolute inset-0 mesh-gradient opacity-10" />
          <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter relative z-10"> Ready to start <br /> your first circle?</h2>
          <div className="flex justify-center gap-6 relative z-10">
            <Link href="/lobby">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-slate-900 px-12 py-6 rounded-full text-xl font-black tracking-tight"
              >
                Launch App
              </motion.button>
            </Link>
          </div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs relative z-10">Fully Decentralized. Audited Contracts. Open Source.</p>
        </motion.div>
      </section>
    </div>
  );
}

