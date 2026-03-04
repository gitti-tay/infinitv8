"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Header } from "@/components/ui/header";
import Link from "next/link";

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState<"crypto" | "holdings" | "activity">("crypto");
  const { address, isConnected } = useAccount();

  return (
    <>
      <Header title="Wallet" showBack={false} />
      <div className="pt-14 pb-24 md:pb-8 animate-fadeIn">
        {/* Balance Card */}
        <div className="px-5 pt-4">
          <div className="relative bg-gradient-to-br from-primary via-primary-dark to-secondary rounded-3xl p-6 text-white shadow-glow overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16" />

            <div className="relative">
              <p className="text-white/70 text-sm mb-1">
                {isConnected ? "Connected Wallet" : "Wallet"}
              </p>
              {isConnected ? (
                <p className="text-sm font-mono mb-4 text-white/90">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
              ) : (
                <h2 className="text-2xl font-bold mb-4">
                  Connect a wallet to get started
                </h2>
              )}

              {/* Quick Actions */}
              <div className="grid grid-cols-3 gap-3">
                <button className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 hover:bg-white/20 transition-all text-center">
                  <span className="material-symbols-outlined text-2xl mb-1">
                    add_circle
                  </span>
                  <p className="text-xs font-bold">Deposit</p>
                </button>
                <button className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 hover:bg-white/20 transition-all text-center">
                  <span className="material-symbols-outlined text-2xl mb-1">
                    arrow_circle_up
                  </span>
                  <p className="text-xs font-bold">Withdraw</p>
                </button>
                <Link
                  href="/wallet/connect"
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 hover:bg-white/20 transition-all text-center"
                >
                  <span className="material-symbols-outlined text-2xl mb-1">
                    account_balance_wallet
                  </span>
                  <p className="text-xs font-bold">{isConnected ? "Manage" : "Connect"}</p>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-5 mt-4">
          <div className="flex gap-2 bg-card-light dark:bg-card-dark p-1 rounded-xl border border-gray-200 dark:border-gray-700">
            {(
              [
                { id: "crypto" as const, icon: "currency_bitcoin", label: "Crypto" },
                { id: "holdings" as const, icon: "inventory_2", label: "Holdings" },
                { id: "activity" as const, icon: "history", label: "Activity" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all ${
                  activeTab === tab.id
                    ? "bg-primary text-white shadow-glow"
                    : "text-text-muted hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <span className="material-symbols-outlined text-base">
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-5 mt-4">
          {/* Crypto Assets Tab */}
          {activeTab === "crypto" && (
            <div className="space-y-3">
              <h3 className="font-bold text-lg mb-2">Crypto Assets</h3>

              {isConnected ? (
                <div className="text-center py-8 bg-card-light dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800">
                  <span className="material-symbols-outlined text-3xl text-primary mb-2">
                    check_circle
                  </span>
                  <p className="font-bold mb-1">Wallet Connected</p>
                  <p className="text-sm text-text-muted mb-2">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </p>
                  <p className="text-xs text-text-muted">
                    On-chain balance viewing coming soon
                  </p>
                </div>
              ) : (
                <div className="text-center py-12 bg-card-light dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-3xl text-primary">
                      account_balance_wallet
                    </span>
                  </div>
                  <h4 className="font-bold text-lg mb-2">No Wallet Connected</h4>
                  <p className="text-sm text-text-muted mb-4">
                    Connect a wallet to view your crypto balances
                  </p>
                  <Link
                    href="/wallet/connect"
                    className="inline-block px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark transition-colors"
                  >
                    Connect Wallet
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Holdings Tab */}
          {activeTab === "holdings" && (
            <div className="space-y-3">
              <h3 className="font-bold text-lg mb-2">Investment Holdings</h3>

              <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="material-symbols-outlined text-primary text-2xl">
                    lightbulb
                  </span>
                  <h4 className="font-bold">Your RWA Holdings</h4>
                </div>
                <p className="text-sm text-text-muted mb-4">
                  Your confirmed investments appear here as tokenized
                  holdings. Visit Portfolio for detailed performance tracking.
                </p>
                <Link
                  href="/portfolio"
                  className="block w-full bg-primary text-white py-3 rounded-xl font-bold text-center hover:bg-primary-dark transition-colors"
                >
                  View Portfolio
                </Link>
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === "activity" && (
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-bold text-lg">Recent Activity</h3>
                <Link
                  href="/transactions"
                  className="text-sm font-bold text-primary"
                >
                  View All
                </Link>
              </div>

              <div className="text-center py-12 bg-card-light dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-3xl text-text-muted">
                    history
                  </span>
                </div>
                <h4 className="font-bold text-lg mb-2">No Recent Activity</h4>
                <p className="text-sm text-text-muted mb-4">
                  Your wallet transactions will appear here
                </p>
                <Link
                  href="/transactions"
                  className="inline-block px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark transition-colors"
                >
                  View Transaction History
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
