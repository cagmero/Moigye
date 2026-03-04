"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { createConfig, WagmiProvider } from "@privy-io/wagmi";
import { http } from "viem";
import { defineChain } from "viem";
import { sepolia } from "viem/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Shield } from "lucide-react";

// 1. Define Custom Chain
export const creditcoinTestnet = defineChain({
    id: 102031,
    name: "Creditcoin Testnet",
    network: "creditcoin-testnet",
    nativeCurrency: {
        name: "Testnet CTC",
        symbol: "tCTC",
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: ["https://rpc.cc3-testnet.creditcoin.network"],
        },
        public: {
            http: ["https://rpc.cc3-testnet.creditcoin.network"],
        },
    },
    blockExplorers: {
        default: {
            name: "Blockscout",
            url: "https://creditcoin-testnet.blockscout.com",
        },
    },
    testnet: true,
});

// 2. Create Wagmi Config via Privy
export const wagmiConfig = createConfig({
    chains: [creditcoinTestnet, sepolia],
    transports: {
        [creditcoinTestnet.id]: http(),
        [sepolia.id]: http(),
    },
});

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
    const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

    if (!appId || appId === "insert-your-privy-app-id-here") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
                <div className="max-w-md w-full glass-morphism p-10 text-center space-y-6">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
                        <Shield className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Setup Required</h2>
                        <p className="text-slate-500 font-medium">Please set your <code className="bg-slate-100 px-1 rounded text-red-600">NEXT_PUBLIC_PRIVY_APP_ID</code> in <code className="bg-slate-100 px-1 rounded text-slate-900">.env.local</code> to enable authentication.</p>
                    </div>
                    <a
                        href="https://dashboard.privy.io"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                        Get your App ID from the Privy Dashboard &rarr;
                    </a>
                </div>
            </div>
        );
    }

    return (
        <PrivyProvider
            appId={appId}
            config={{
                appearance: {
                    theme: "light",
                    accentColor: "#0F172A",
                    showWalletLoginFirst: false,
                },
                supportedChains: [creditcoinTestnet, sepolia],
                defaultChain: creditcoinTestnet,
                embeddedWallets: {
                    ethereum: {
                        createOnLogin: "users-without-wallets",
                    },
                },
            }}
        >
            <QueryClientProvider client={queryClient}>
                <WagmiProvider config={wagmiConfig}>
                    {children}
                </WagmiProvider>
            </QueryClientProvider>
        </PrivyProvider>
    );
}
