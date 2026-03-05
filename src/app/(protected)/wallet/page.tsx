"use client";

import { useEffect, useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { formatUnits } from "viem";
import { Header } from "@/components/ui/header";
import Link from "next/link";

import { useTokenBalance } from "@/hooks/useTokenBalance";
import { useInvestmentTokens } from "@/hooks/useInvestmentTokens";
import { getBasescanUrl } from "@/lib/contracts/addresses";

interface Transaction {
  id: string;
  type: string;
  asset: string;
  amount: number;
  status: string;
  txHash: string | null;
  description: string | null;
  createdAt: string;
  project?: { name: string; ticker: string } | null;
}

const SECURITY_ITEMS = [
  {
    icon: "fingerprint",
    iconBg: "bg-accent/10",
    iconColor: "text-accent-light",
    title: "Biometric Authentication",
    desc: "Use Face ID or fingerprint to authorize transactions",
    type: "toggle" as const,
    defaultOn: true,
  },
  {
    icon: "lock",
    iconBg: "bg-primary/10",
    iconColor: "text-primary-light",
    title: "Withdrawal Address Whitelist",
    desc: "Only allow withdrawals to pre-approved addresses (24h lock period)",
    type: "toggle" as const,
    defaultOn: true,
  },
  {
    icon: "mail",
    iconBg: "bg-amber/10",
    iconColor: "text-amber",
    title: "Email Confirmation for Withdrawals",
    desc: "Require email verification code for every withdrawal",
    type: "toggle" as const,
    defaultOn: true,
  },
  {
    icon: "security",
    iconBg: "bg-purple/10",
    iconColor: "text-purple",
    title: "Anti-Phishing Code",
    desc: "Set a unique code that appears in all official emails from us",
    type: "button" as const,
    buttonLabel: "Set Code",
  },
  {
    icon: "devices",
    iconBg: "bg-cyan/10",
    iconColor: "text-cyan",
    title: "Device Management",
    desc: "2 active devices \u2022 Last login: MacBook Pro, Feb 28",
    type: "button" as const,
    buttonLabel: "Manage",
  },
];

function getTxConfig(type: string) {
  switch (type) {
    case "INVESTMENT": return { icon: "trending_up", iconBg: "bg-purple/10", iconColor: "text-purple", label: "Investment" };
    case "YIELD":      return { icon: "payments", iconBg: "bg-accent/10", iconColor: "text-accent-light", label: "Yield" };
    case "DEPOSIT":    return { icon: "add_circle", iconBg: "bg-primary/10", iconColor: "text-primary-light", label: "Deposit" };
    case "WITHDRAWAL": return { icon: "arrow_circle_up", iconBg: "bg-destructive/10", iconColor: "text-destructive", label: "Withdrawal" };
    case "TRANSFER":   return { icon: "swap_horiz", iconBg: "bg-primary/10", iconColor: "text-primary-light", label: "Transfer" };
    default:           return { icon: "receipt", iconBg: "bg-gray-100", iconColor: "text-gray-500", label: type };
  }
}

export default function WalletPage() {
  const { address, isConnected, chain, chainId } = useAccount();
  const { disconnect } = useDisconnect();
  const { usdcBalance, usdtBalance, ethBalance, ethFormatted, isLoading: balLoading } = useTokenBalance();
  const { balances: tokenHoldings, isLoading: holdingsLoading } = useInvestmentTokens([BigInt(1), BigInt(2), BigInt(3), BigInt(4), BigInt(5)]);
  const basescanUrl = getBasescanUrl(chainId ?? 8453);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(true);
  const [securityToggles, setSecurityToggles] = useState<Record<string, boolean>>({
    fingerprint: true,
    lock: true,
    mail: true,
  });

  // Fetch real transactions
  useEffect(() => {
    async function fetchTransactions() {
      try {
        const res = await fetch("/api/transactions?limit=5");
        if (res.ok) {
          const data = await res.json();
          setTransactions(Array.isArray(data) ? data : data.transactions || []);
        }
      } catch {
        // Silently fail for transactions
      } finally {
        setTxLoading(false);
      }
    }
    fetchTransactions();
  }, []);

  function handleToggle(key: string) {
    setSecurityToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  // Format balance helpers
  const usdcFormatted = usdcBalance !== undefined ? parseFloat(formatUnits(usdcBalance, 6)) : 0;
  const usdtFormatted = usdtBalance !== undefined ? parseFloat(formatUnits(usdtBalance, 6)) : 0;
  const ethFloat = ethBalance !== undefined ? parseFloat(formatUnits(ethBalance, 18)) : 0;

  const tokens = [
    { symbol: "USDC", name: "USD Coin", network: "Base", balance: usdcFormatted, color: "from-[#2775ca] to-[#1a5fb4]", letter: "U" },
    { symbol: "USDT", name: "Tether", network: "Base", balance: usdtFormatted, color: "from-[#26a17b] to-[#1a9b72]", letter: "T" },
    { symbol: "ETH", name: "Ethereum", network: "Base", balance: ethFloat, color: "from-[#627eea] to-[#4a6cf7]", letter: "E" },
  ];

  const totalUsdBalance = usdcFormatted + usdtFormatted;

  return (
    <>
      <Header title="Wallet" showBack={false} />
      <div className="pt-16 pb-24 md:pb-8 px-5 animate-fadeIn">

        {/* Wallet Hero */}
        <div className="mt-4 bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/15 rounded-xl p-6 md:p-8 mb-6">
          <p className="text-[11px] uppercase tracking-widest text-text-muted mb-1">
            Wallet Balance (Stablecoins)
          </p>
          <p className="text-4xl md:text-5xl font-black tracking-tight font-mono">
            ${Math.floor(totalUsdBalance).toLocaleString("en-US")}
            <span className="text-xl text-text-muted">
              .{(totalUsdBalance % 1).toFixed(2).slice(2)}
            </span>
          </p>
          <div className="flex items-center gap-6 mt-2 mb-5">
            <span className="text-sm text-text-secondary">
              ETH:{" "}
              <span className="font-mono font-semibold text-text-primary">
                {ethFloat.toFixed(6)}
              </span>
            </span>
            {isConnected && (
              <span className="text-sm text-text-secondary">
                Network:{" "}
                <span className="font-semibold text-primary-light">
                  {chain?.name ?? "Base"}
                </span>
              </span>
            )}
          </div>

          {/* CTA */}
          <Link
            href="/investments"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark transition-colors shadow-glow"
          >
            <span className="material-symbols-outlined text-lg">trending_up</span>
            Invest Now
          </Link>
        </div>

        {/* Two-Column Grid: Tokens + Connected Wallet */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

          {/* Token Balances */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-base font-bold mb-4">On-Chain Balances</h3>
            {!isConnected ? (
              <div className="text-center py-6">
                <p className="text-sm text-text-muted mb-3">Connect wallet to view balances</p>
              </div>
            ) : balLoading ? (
              <div className="py-6 text-center text-text-muted animate-pulse">Loading balances...</div>
            ) : (
              <div className="divide-y divide-border">
                {tokens.map((token) => (
                  <div key={token.symbol} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-br ${token.color} flex items-center justify-center text-white font-extrabold text-base shrink-0`}
                    >
                      {token.letter}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{token.symbol}</p>
                      <p className="text-xs text-text-muted">
                        {token.name} &bull; {token.network}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-sm">
                        {token.symbol === "ETH"
                          ? token.balance.toFixed(6)
                          : token.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })
                        }
                      </p>
                      {token.symbol !== "ETH" && (
                        <p className="text-xs text-text-muted">
                          ${token.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Connected Wallet */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-base font-bold mb-4">Connected Wallet</h3>

            {isConnected ? (
              <>
                <div className="flex items-center gap-4 bg-background-tertiary border border-border rounded-xl p-5 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-amber/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-amber">
                      account_balance_wallet
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold mb-1">Wallet</p>
                    <a
                      href={`${basescanUrl}/address/${address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-sm bg-background-secondary px-3 py-1 rounded-md inline-flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                      <span className="material-symbols-outlined text-xs">open_in_new</span>
                    </a>
                    <p className="text-xs text-text-muted mt-1">
                      {chain?.name ?? "Base"}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 text-[11px] font-semibold bg-accent/10 text-accent-light rounded-full">
                    Connected
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {[
                    { label: "Network", value: chain?.name ?? "Base" },
                    { label: "Chain ID", value: String(chain?.id ?? 8453), mono: true },
                    { label: "Basescan", value: "View on Basescan", link: `${basescanUrl}/address/${address}` },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex justify-between items-center px-3 py-2.5 bg-background-tertiary rounded-lg text-[13px]"
                    >
                      <span className="text-text-secondary">{row.label}</span>
                      {"link" in row && row.link ? (
                        <a
                          href={row.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-primary hover:underline flex items-center gap-1"
                        >
                          {row.value}
                          <span className="material-symbols-outlined text-xs">open_in_new</span>
                        </a>
                      ) : (
                        <span className={`font-semibold ${row.mono ? "font-mono" : ""}`}>
                          {row.value}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => disconnect()}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-destructive/10 border border-destructive/20 rounded-lg text-[13px] font-medium text-destructive hover:bg-destructive/15 transition-all"
                  >
                    <span className="material-symbols-outlined text-base">link_off</span>
                    Disconnect
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-3xl text-primary">
                    account_balance_wallet
                  </span>
                </div>
                <h4 className="font-bold text-lg mb-2">No Wallet Connected</h4>
                <p className="text-sm text-text-muted mb-4">
                  Connect a wallet to view your on-chain balances and investments
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
        </div>

        {/* Investment Token Holdings (ERC-1155) */}
        {isConnected && (
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h3 className="text-base font-bold mb-4">Investment Tokens (ERC-1155)</h3>
            <p className="text-xs text-text-muted mb-4">
              Tokenized investment positions on Base — verifiable on Basescan
            </p>
            {holdingsLoading ? (
              <div className="py-6 text-center text-text-muted animate-pulse">Loading holdings...</div>
            ) : tokenHoldings.filter(h => h.balance > BigInt(0)).length === 0 ? (
              <div className="text-center py-6">
                <span className="material-symbols-outlined text-4xl text-text-muted mb-2">token</span>
                <p className="text-sm text-text-muted">No investment tokens yet</p>
                <Link
                  href="/investments"
                  className="inline-block mt-3 text-sm text-primary font-bold hover:underline"
                >
                  Browse Investment Opportunities
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {tokenHoldings.filter(h => h.balance > BigInt(0)).map((holding) => (
                  <div
                    key={holding.projectId}
                    className="flex items-center gap-4 p-4 bg-background-tertiary border border-border rounded-xl"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary">token</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">Project #{holding.projectId}</p>
                      <p className="text-xs text-text-muted">Token ID: {holding.projectId}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-sm">
                        ${formatUnits(holding.balance, 6)}
                      </p>
                      <a
                        href={`${basescanUrl}/token/${address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        View on Basescan
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Security Settings */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h3 className="text-base font-bold mb-4">Security Settings</h3>
          <div className="space-y-2">
            {SECURITY_ITEMS.map((item) => (
              <div
                key={item.icon}
                className="flex items-center gap-4 p-4 bg-background-tertiary border border-border rounded-lg"
              >
                <div
                  className={`w-10 h-10 rounded-[10px] ${item.iconBg} flex items-center justify-center shrink-0`}
                >
                  <span className={`material-symbols-outlined ${item.iconColor}`}>
                    {item.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-text-muted">{item.desc}</p>
                </div>

                {item.type === "toggle" ? (
                  <button
                    onClick={() => handleToggle(item.icon)}
                    className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                      securityToggles[item.icon] ? "bg-accent" : "bg-border"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${
                        securityToggles[item.icon] ? "left-[22px]" : "left-0.5"
                      }`}
                    />
                  </button>
                ) : (
                  <button className="px-4 py-1.5 bg-background-secondary border border-border rounded-lg text-xs font-medium text-primary-light shrink-0 hover:border-primary/30 transition-all">
                    {item.buttonLabel}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold">Recent Transactions</h3>
            <Link href="/transactions" className="text-xs text-primary-light font-medium">
              View All &rarr;
            </Link>
          </div>

          {txLoading ? (
            <div className="py-6 text-center text-text-muted animate-pulse">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-6">
              <span className="material-symbols-outlined text-4xl text-text-muted mb-2">receipt_long</span>
              <p className="text-sm text-text-muted">No transactions yet</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2.5 text-[11px] text-text-muted uppercase tracking-wider font-medium">Type</th>
                      <th className="text-left py-2.5 text-[11px] text-text-muted uppercase tracking-wider font-medium">Asset</th>
                      <th className="text-left py-2.5 text-[11px] text-text-muted uppercase tracking-wider font-medium">Amount</th>
                      <th className="text-left py-2.5 text-[11px] text-text-muted uppercase tracking-wider font-medium">Status</th>
                      <th className="text-left py-2.5 text-[11px] text-text-muted uppercase tracking-wider font-medium">Date</th>
                      <th className="text-right py-2.5 text-[11px] text-text-muted uppercase tracking-wider font-medium">TX Hash</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => {
                      const config = getTxConfig(tx.type);
                      const isDebit = ["INVESTMENT", "WITHDRAWAL", "FEE"].includes(tx.type);
                      return (
                        <tr key={tx.id} className="border-b border-border last:border-b-0">
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-md ${config.iconBg} flex items-center justify-center`}>
                                <span className={`material-symbols-outlined text-sm ${config.iconColor}`}>{config.icon}</span>
                              </div>
                              <span className="text-[13px] font-medium">{config.label}</span>
                            </div>
                          </td>
                          <td className="py-3 text-[13px]">{tx.project?.ticker || tx.asset || "—"}</td>
                          <td className={`py-3 font-mono font-semibold text-[13px] ${isDebit ? "text-text-primary" : "text-accent-light"}`}>
                            {isDebit ? "-" : "+"}${Math.abs(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              tx.status === "COMPLETED" ? "bg-accent/10 text-accent-light"
                              : tx.status === "PENDING" ? "bg-amber/10 text-amber"
                              : "bg-destructive/10 text-destructive"
                            }`}>
                              {tx.status === "COMPLETED" ? "Completed" : tx.status === "PENDING" ? "Pending" : tx.status}
                            </span>
                          </td>
                          <td className="py-3 text-[13px] text-text-secondary">
                            {new Date(tx.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </td>
                          <td className="py-3 text-right">
                            {tx.txHash ? (
                              <a
                                href={`${basescanUrl}/tx/${tx.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono text-xs text-primary hover:underline"
                              >
                                {tx.txHash.slice(0, 6)}...{tx.txHash.slice(-4)}
                              </a>
                            ) : (
                              <span className="font-mono text-xs text-text-muted">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile list */}
              <div className="md:hidden space-y-3">
                {transactions.map((tx) => {
                  const config = getTxConfig(tx.type);
                  const isDebit = ["INVESTMENT", "WITHDRAWAL", "FEE"].includes(tx.type);
                  return (
                    <div key={tx.id} className="flex items-center gap-3 py-3 border-b border-border last:border-b-0">
                      <div className={`w-9 h-9 rounded-lg ${config.iconBg} flex items-center justify-center shrink-0`}>
                        <span className={`material-symbols-outlined text-lg ${config.iconColor}`}>{config.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{config.label}</span>
                          <span className="text-xs text-text-muted">{tx.project?.ticker || tx.asset}</span>
                        </div>
                        <p className="text-xs text-text-muted">
                          {new Date(tx.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-mono font-semibold text-sm ${isDebit ? "text-text-primary" : "text-accent-light"}`}>
                          {isDebit ? "-" : "+"}${Math.abs(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </p>
                        {tx.txHash ? (
                          <a
                            href={`${basescanUrl}/tx/${tx.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-mono text-primary"
                          >
                            {tx.txHash.slice(0, 6)}...{tx.txHash.slice(-4)}
                          </a>
                        ) : (
                          <span className={`inline-block px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            tx.status === "COMPLETED" ? "bg-accent/10 text-accent-light" : "bg-amber/10 text-amber"
                          }`}>
                            {tx.status === "COMPLETED" ? "Completed" : "Pending"}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
