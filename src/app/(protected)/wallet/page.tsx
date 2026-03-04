"use client";

import { useState } from "react";
import { Header } from "@/components/ui/header";
import Link from "next/link";

interface CryptoAsset {
  symbol: string;
  name: string;
  amount: number;
  usdValue: number;
  change24h: number;
  price: number;
}

interface Transaction {
  id: number;
  type: "deposit" | "withdraw" | "dividend";
  amount: number;
  currency: string;
  date: string;
  status: "completed" | "pending";
  description: string;
}

const cryptoAssets: CryptoAsset[] = [
  { symbol: "USDT", name: "Tether", amount: 15420.3, usdValue: 15420.3, change24h: 0.02, price: 1.0 },
  { symbol: "USDC", name: "USD Coin", amount: 6890.4, usdValue: 6890.4, change24h: -0.01, price: 1.0 },
  { symbol: "ETH", name: "Ethereum", amount: 0.178, usdValue: 404.0, change24h: 1.82, price: 2269.66 },
  { symbol: "BTC", name: "Bitcoin", amount: 0.0421, usdValue: 1875.8, change24h: 2.45, price: 44551.0 },
];

const mockTransactions: Transaction[] = [
  { id: 1, type: "deposit", amount: 5000, currency: "USDT", date: "2026-02-04T14:30:00", status: "completed", description: "Bank Transfer" },
  { id: 2, type: "withdraw", amount: 2500, currency: "USDC", date: "2026-02-03T10:15:00", status: "completed", description: "To Bank Account" },
  { id: 3, type: "dividend", amount: 125.5, currency: "USDT", date: "2026-02-01T09:00:00", status: "completed", description: "SCN Monthly Dividend" },
  { id: 4, type: "withdraw", amount: 1500, currency: "USDT", date: "2026-02-05T16:45:00", status: "pending", description: "To Bank Account" },
];

function getTransactionIcon(type: string) {
  if (type === "deposit") return "arrow_downward";
  if (type === "withdraw") return "arrow_upward";
  if (type === "dividend") return "payments";
  return "receipt";
}

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState<"crypto" | "holdings" | "activity">("crypto");
  const [filterType, setFilterType] = useState<string>("all");

  const totalBalance = cryptoAssets.reduce((sum, asset) => sum + asset.usdValue, 0);

  const filteredTransactions = mockTransactions.filter((tx) => {
    if (filterType !== "all" && tx.type !== filterType) return false;
    return true;
  });

  return (
    <>
      <Header title="Wallet" showBack={false} />
      <div className="pt-14 pb-24 animate-fadeIn">
        {/* Balance Card */}
        <div className="px-5 pt-4">
          <div className="relative bg-gradient-to-br from-primary via-primary-dark to-secondary rounded-3xl p-6 text-white shadow-glow overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16" />

            <div className="relative">
              <p className="text-white/70 text-sm mb-1">Total Balance</p>
              <h2 className="text-4xl font-bold mb-2">
                $
                {totalBalance.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h2>
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-1 bg-accent/20 px-2.5 py-1 rounded-full border border-accent/30">
                  <span className="material-symbols-outlined text-sm">
                    trending_up
                  </span>
                  <span className="text-sm font-bold">+2.3%</span>
                </div>
                <span className="text-white/70 text-xs">Last 24h</span>
              </div>

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
                  <p className="text-xs font-bold">Connect</p>
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
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg">Crypto Assets</h3>
                <span className="text-xs text-text-muted bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold">
                  Demo Data
                </span>
              </div>

              {cryptoAssets.map((asset) => (
                <div
                  key={asset.symbol}
                  className="bg-card-light dark:bg-card-dark rounded-2xl p-4 border border-gray-100 dark:border-gray-800"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold">
                      {asset.symbol.substring(0, 2)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold">{asset.symbol}</h4>
                        <span className="text-xs text-text-muted">
                          {asset.name}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted">
                        {asset.amount.toFixed(4)} {asset.symbol}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        ${asset.usdValue.toLocaleString("en-US")}
                      </p>
                      <div
                        className={`flex items-center gap-1 text-xs font-bold ${
                          asset.change24h >= 0
                            ? "text-accent"
                            : "text-red-500"
                        }`}
                      >
                        <span className="material-symbols-outlined text-xs">
                          {asset.change24h >= 0
                            ? "trending_up"
                            : "trending_down"}
                        </span>
                        {asset.change24h >= 0 ? "+" : ""}
                        {asset.change24h}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Holdings Tab */}
          {activeTab === "holdings" && (
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg">Investment Holdings</h3>
              </div>

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

              <div className="flex gap-2 overflow-x-auto pb-2">
                {["all", "deposit", "withdraw", "dividend"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap ${
                      filterType === type
                        ? "bg-primary text-white"
                        : "bg-card-light dark:bg-card-dark border border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    {type === "all"
                      ? "All"
                      : type.charAt(0).toUpperCase() + type.slice(1) + "s"}
                  </button>
                ))}
              </div>

              {filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="bg-card-light dark:bg-card-dark rounded-2xl p-4 border border-gray-100 dark:border-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.type === "deposit" || tx.type === "dividend"
                          ? "bg-green-100 dark:bg-green-900/30"
                          : "bg-blue-100 dark:bg-blue-900/30"
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined ${
                          tx.type === "deposit" || tx.type === "dividend"
                            ? "text-green-600"
                            : "text-blue-600"
                        }`}
                      >
                        {getTransactionIcon(tx.type)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-sm capitalize">
                          {tx.type}
                        </p>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            tx.status === "completed"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                              : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                          }`}
                        >
                          {tx.status}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted truncate">
                        {tx.description}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {new Date(tx.date).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold ${
                          tx.type === "deposit" || tx.type === "dividend"
                            ? "text-accent"
                            : ""
                        }`}
                      >
                        {tx.type === "deposit" || tx.type === "dividend"
                          ? "+"
                          : ""}
                        {tx.amount} {tx.currency}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
