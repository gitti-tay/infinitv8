"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/ui/header";

interface Wallet {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconBg: string;
  popular: boolean;
}

const wallets: Wallet[] = [
  {
    id: "metamask",
    name: "MetaMask",
    description: "Most popular wallet",
    icon: "pets",
    iconBg: "bg-orange-50 dark:bg-orange-900/20",
    popular: true,
  },
  {
    id: "walletconnect",
    name: "WalletConnect",
    description: "Scan with mobile wallet",
    icon: "link",
    iconBg: "bg-blue-50 dark:bg-blue-900/20",
    popular: true,
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    description: "Secure & easy to use",
    icon: "account_balance_wallet",
    iconBg: "bg-blue-50 dark:bg-blue-900/20",
    popular: true,
  },
  {
    id: "trust",
    name: "Trust Wallet",
    description: "Mobile-first wallet",
    icon: "shield",
    iconBg: "bg-purple-50 dark:bg-purple-900/20",
    popular: false,
  },
  {
    id: "phantom",
    name: "Phantom",
    description: "Solana & Ethereum",
    icon: "visibility",
    iconBg: "bg-purple-50 dark:bg-purple-900/20",
    popular: false,
  },
  {
    id: "ledger",
    name: "Ledger",
    description: "Hardware wallet",
    icon: "lock",
    iconBg: "bg-gray-50 dark:bg-gray-900/20",
    popular: false,
  },
];

export default function ConnectWalletPage() {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  const handleConnectWallet = (walletId: string) => {
    setSelectedWallet(walletId);
    setIsConnecting(true);

    setTimeout(() => {
      setIsConnecting(false);
      router.push("/wallet");
    }, 1500);
  };

  const popularWallets = wallets.filter((w) => w.popular);
  const otherWallets = wallets.filter((w) => !w.popular);

  return (
    <>
      <Header title="Connect Wallet" />
      <div className="pt-16 pb-24 px-5 animate-fadeIn space-y-6">
        {/* Progress Indicator */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-primary">Step 1 of 3</span>
            <span className="text-xs text-text-muted">Wallet Connection</span>
          </div>
          <div className="flex gap-1.5">
            <div className="h-1 flex-1 bg-primary rounded-full" />
            <div className="h-1 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="h-1 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full" />
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-white relative overflow-hidden">
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

        {/* Popular Wallets */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Popular Wallets</h3>
            <span className="text-xs text-text-muted">
              {popularWallets.length} available
            </span>
          </div>
          <div className="space-y-3">
            {popularWallets.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => handleConnectWallet(wallet.id)}
                disabled={isConnecting && selectedWallet !== wallet.id}
                className="w-full bg-card-light dark:bg-card-dark rounded-2xl p-5 border-2 border-gray-100 dark:border-gray-700 hover:border-primary dark:hover:border-primary transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 ${wallet.iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <span className="material-symbols-outlined text-2xl text-primary">
                      {wallet.icon}
                    </span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold">{wallet.name}</p>
                    <p className="text-sm text-text-muted">
                      {wallet.description}
                    </p>
                  </div>
                  {isConnecting && selectedWallet === wallet.id ? (
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined animate-spin text-primary">
                        progress_activity
                      </span>
                      <span className="text-xs font-bold text-primary">
                        Connecting...
                      </span>
                    </div>
                  ) : (
                    <span className="material-symbols-outlined text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all">
                      arrow_forward
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Other Wallets */}
        <div>
          <h3 className="font-bold text-lg mb-4">More Wallets</h3>
          <div className="grid grid-cols-2 gap-3">
            {otherWallets.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => handleConnectWallet(wallet.id)}
                disabled={isConnecting && selectedWallet !== wallet.id}
                className="bg-card-light dark:bg-card-dark rounded-xl p-4 border border-gray-100 dark:border-gray-700 hover:border-primary dark:hover:border-primary transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="flex flex-col items-center gap-3">
                  <div
                    className={`w-12 h-12 ${wallet.iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <span className="material-symbols-outlined text-xl text-primary">
                      {wallet.icon}
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-sm mb-0.5">{wallet.name}</p>
                    <p className="text-xs text-text-muted line-clamp-1">
                      {wallet.description}
                    </p>
                  </div>
                  {isConnecting && selectedWallet === wallet.id && (
                    <span className="material-symbols-outlined animate-spin text-primary text-sm">
                      progress_activity
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
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
