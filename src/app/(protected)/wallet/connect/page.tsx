"use client";

import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Header } from "@/components/ui/header";
import { useEffect } from "react";

export default function ConnectWalletPage() {
  const router = useRouter();
  const { isConnected } = useAccount();

  useEffect(() => {
    if (isConnected) {
      router.push("/wallet");
    }
  }, [isConnected, router]);

  return (
    <>
      <Header title="Connect Wallet" />
      <div className="pt-16 pb-24 md:pb-8 px-5 animate-fadeIn space-y-6">
        {/* Info Banner */}
        <div className="mt-4 bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <span className="material-symbols-outlined text-2xl">
                  account_balance_wallet
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold">Connect Your Wallet</h2>
                <p className="text-white/80 text-sm">
                  Secure & seamless access
                </p>
              </div>
            </div>
            <p className="text-white/90 text-sm leading-relaxed">
              Link your crypto wallet to invest, manage assets, and track your
              portfolio in real-time.
            </p>
          </div>
        </div>

        {/* RainbowKit Connect Button */}
        <div className="bg-card-light dark:bg-card-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
          <h3 className="font-bold text-lg mb-4 text-center">Choose Your Wallet</h3>
          <div className="flex justify-center">
            <ConnectButton />
          </div>
          <p className="text-xs text-text-muted text-center mt-4">
            Supports MetaMask, Trust Wallet, Coinbase, WalletConnect, and more
          </p>
        </div>

        {/* Security Features */}
        <div className="bg-card-light dark:bg-card-dark rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
          <h4 className="font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">
              verified_user
            </span>
            Security Features
          </h4>
          <div className="space-y-3">
            {[
              { icon: "encrypted", text: "End-to-end encryption" },
              { icon: "no_accounts", text: "We never store your keys" },
              { icon: "security", text: "Multi-signature protection" },
              { icon: "verified_user", text: "Audited smart contracts" },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="material-symbols-outlined text-accent text-sm">
                  {feature.icon}
                </span>
                <span className="text-sm text-text-muted">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Security Tips */}
        <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-4">
          <div className="flex gap-3">
            <span className="material-symbols-outlined text-primary shrink-0">
              info
            </span>
            <div className="text-sm">
              <p className="font-bold mb-1">Important Security Tips</p>
              <ul className="space-y-1 text-xs text-text-muted">
                <li>Only connect wallets you own and trust</li>
                <li>Never share your private keys or seed phrase</li>
                <li>Always verify the URL before connecting</li>
                <li>Use hardware wallets for large amounts</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Skip Button */}
        <button
          onClick={() => router.push("/wallet")}
          className="w-full text-text-muted font-medium py-3 hover:text-primary transition-colors flex items-center justify-center gap-1"
        >
          Skip for now
          <span className="material-symbols-outlined text-sm">
            arrow_forward
          </span>
        </button>
      </div>
    </>
  );
}
