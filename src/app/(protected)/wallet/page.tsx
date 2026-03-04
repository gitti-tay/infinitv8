"use client";

import { useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { Header } from "@/components/ui/header";
import Link from "next/link";

const TOKENS = [
  {
    symbol: "USDT",
    name: "Tether",
    network: "TRC20",
    balance: 5240.0,
    usd: 5240.0,
    color: "from-[#26a17b] to-[#1a9b72]",
    letter: "T",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    network: "ERC20",
    balance: 2300.0,
    usd: 2300.0,
    color: "from-[#2775ca] to-[#1a5fb4]",
    letter: "U",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    network: "Mainnet",
    balance: 0.0,
    usd: 0.0,
    color: "from-[#627eea] to-[#4a6cf7]",
    letter: "E",
  },
];

const TRANSACTIONS = [
  {
    type: "Yield",
    icon: "payments",
    iconBg: "bg-accent/10",
    iconColor: "text-accent-light",
    asset: "SCN",
    amount: "+$125.50",
    amountColor: "text-accent-light",
    status: "Completed",
    statusColor: "bg-accent/10 text-accent-light",
    date: "Feb 15, 2026",
    hash: "0x8f3a...2d1e",
  },
  {
    type: "Investment",
    icon: "trending_up",
    iconBg: "bg-purple/10",
    iconColor: "text-purple",
    asset: "MDD",
    amount: "-$8,000.00",
    amountColor: "text-text-primary",
    status: "Confirmed",
    statusColor: "bg-accent/10 text-accent-light",
    date: "Feb 10, 2026",
    hash: "0x4b2c...9f7a",
  },
  {
    type: "Deposit",
    icon: "add_circle",
    iconBg: "bg-primary/10",
    iconColor: "text-primary-light",
    asset: "USDT",
    amount: "+$10,000.00",
    amountColor: "text-accent-light",
    status: "Completed",
    statusColor: "bg-accent/10 text-accent-light",
    date: "Feb 8, 2026",
    hash: "0x1d5e...7b3c",
  },
  {
    type: "Yield",
    icon: "payments",
    iconBg: "bg-accent/10",
    iconColor: "text-accent-light",
    asset: "PTF",
    amount: "+$89.20",
    amountColor: "text-accent-light",
    status: "Completed",
    statusColor: "bg-accent/10 text-accent-light",
    date: "Jan 20, 2026",
    hash: "0x9e2f...4a8b",
  },
  {
    type: "Withdrawal",
    icon: "arrow_circle_up",
    iconBg: "bg-destructive/10",
    iconColor: "text-destructive",
    asset: "USDC",
    amount: "-$2,000.00",
    amountColor: "text-text-primary",
    status: "Completed",
    statusColor: "bg-accent/10 text-accent-light",
    date: "Jan 15, 2026",
    hash: "0x6c8d...1e5f",
  },
];

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

export default function WalletPage() {
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const [securityToggles, setSecurityToggles] = useState<Record<string, boolean>>({
    fingerprint: true,
    lock: true,
    mail: true,
  });

  function handleToggle(key: string) {
    setSecurityToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <>
      <Header title="Wallet" showBack={false} />
      <div className="pt-16 pb-24 md:pb-8 px-5 animate-fadeIn">

        {/* ── Wallet Hero ── */}
        <div className="mt-4 bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/15 rounded-xl p-6 md:p-8 mb-6">
          <p className="text-[11px] uppercase tracking-widest text-text-muted mb-1">
            Total Balance
          </p>
          <p className="text-4xl md:text-5xl font-black tracking-tight font-mono">
            $42,590<span className="text-xl text-text-muted">.00</span>
          </p>
          <div className="flex items-center gap-6 mt-2 mb-5">
            <span className="text-sm text-text-secondary">
              Available:{" "}
              <span className="font-mono font-semibold text-text-primary">$7,540.00</span>
            </span>
            <span className="text-sm text-text-secondary">
              Invested:{" "}
              <span className="font-mono font-semibold text-primary-light">$35,050.00</span>
            </span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: "add_circle", label: "Deposit", bg: "bg-accent/15", color: "text-accent-light" },
              { icon: "arrow_circle_up", label: "Withdraw", bg: "bg-destructive/15", color: "text-destructive" },
              { icon: "swap_horiz", label: "Transfer", bg: "bg-primary/15", color: "text-primary-light" },
              { icon: "qr_code_scanner", label: "QR Scan", bg: "bg-purple/15", color: "text-purple" },
            ].map((action) => (
              <button
                key={action.label}
                className="flex flex-col items-center gap-1.5 py-4 bg-background-tertiary border border-border rounded-xl hover:border-primary/30 transition-all"
              >
                <div
                  className={`w-11 h-11 rounded-full ${action.bg} flex items-center justify-center`}
                >
                  <span className={`material-symbols-outlined ${action.color}`}>
                    {action.icon}
                  </span>
                </div>
                <span className="text-[13px] font-semibold">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Two-Column Grid: Tokens + Connected Wallet ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

          {/* Token Balances */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-base font-bold mb-4">Token Balances</h3>
            <div className="divide-y divide-border">
              {TOKENS.map((token) => (
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
                      {token.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-text-muted">
                      ${token.usd.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Connected Wallet */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-base font-bold mb-4">Connected Wallet</h3>

            {isConnected ? (
              <>
                {/* Wallet card */}
                <div className="flex items-center gap-4 bg-background-tertiary border border-border rounded-xl p-5 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-amber/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-amber">
                      account_balance_wallet
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold mb-1">MetaMask</p>
                    <p className="font-mono text-sm bg-background-secondary px-3 py-1 rounded-md inline-block">
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      {chain?.name ?? "Ethereum Mainnet"}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 text-[11px] font-semibold bg-accent/10 text-accent-light rounded-full">
                    Connected
                  </span>
                </div>

                {/* Details rows */}
                <div className="space-y-2 mb-4">
                  {[
                    { label: "Network", value: chain?.name ?? "Ethereum Mainnet" },
                    { label: "Chain ID", value: String(chain?.id ?? 1), mono: true },
                    { label: "Connected Since", value: "Feb 5, 2026" },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex justify-between items-center px-3 py-2.5 bg-background-tertiary rounded-lg text-[13px]"
                    >
                      <span className="text-text-secondary">{row.label}</span>
                      <span className={`font-semibold ${row.mono ? "font-mono" : ""}`}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-background-tertiary border border-border rounded-lg text-[13px] font-medium text-text-secondary hover:border-primary/30 transition-all">
                    <span className="material-symbols-outlined text-base">swap_horiz</span>
                    Switch Network
                  </button>
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
                  Connect a wallet to view your balances
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

        {/* ── Security Settings ── */}
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

        {/* ── Recent Transactions ── */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold">Recent Transactions</h3>
            <Link href="/transactions" className="text-xs text-primary-light font-medium">
              View All &rarr;
            </Link>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2.5 text-[11px] text-text-muted uppercase tracking-wider font-medium">
                    Type
                  </th>
                  <th className="text-left py-2.5 text-[11px] text-text-muted uppercase tracking-wider font-medium">
                    Asset
                  </th>
                  <th className="text-left py-2.5 text-[11px] text-text-muted uppercase tracking-wider font-medium">
                    Amount
                  </th>
                  <th className="text-left py-2.5 text-[11px] text-text-muted uppercase tracking-wider font-medium">
                    Status
                  </th>
                  <th className="text-left py-2.5 text-[11px] text-text-muted uppercase tracking-wider font-medium">
                    Date
                  </th>
                  <th className="text-right py-2.5 text-[11px] text-text-muted uppercase tracking-wider font-medium">
                    TX Hash
                  </th>
                </tr>
              </thead>
              <tbody>
                {TRANSACTIONS.map((tx, i) => (
                  <tr key={i} className="border-b border-border last:border-b-0">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-md ${tx.iconBg} flex items-center justify-center`}
                        >
                          <span
                            className={`material-symbols-outlined text-sm ${tx.iconColor}`}
                          >
                            {tx.icon}
                          </span>
                        </div>
                        <span className="text-[13px] font-medium">{tx.type}</span>
                      </div>
                    </td>
                    <td className="py-3 text-[13px]">{tx.asset}</td>
                    <td className={`py-3 font-mono font-semibold text-[13px] ${tx.amountColor}`}>
                      {tx.amount}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${tx.statusColor}`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 text-[13px] text-text-secondary">{tx.date}</td>
                    <td className="py-3 text-right">
                      <span className="font-mono text-xs text-text-muted">{tx.hash}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile list */}
          <div className="md:hidden space-y-3">
            {TRANSACTIONS.map((tx, i) => (
              <div
                key={i}
                className="flex items-center gap-3 py-3 border-b border-border last:border-b-0"
              >
                <div
                  className={`w-9 h-9 rounded-lg ${tx.iconBg} flex items-center justify-center shrink-0`}
                >
                  <span className={`material-symbols-outlined text-lg ${tx.iconColor}`}>
                    {tx.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{tx.type}</span>
                    <span className="text-xs text-text-muted">{tx.asset}</span>
                  </div>
                  <p className="text-xs text-text-muted">{tx.date}</p>
                </div>
                <div className="text-right">
                  <p className={`font-mono font-semibold text-sm ${tx.amountColor}`}>
                    {tx.amount}
                  </p>
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${tx.statusColor}`}
                  >
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
