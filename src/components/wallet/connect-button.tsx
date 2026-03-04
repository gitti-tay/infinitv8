"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export function WalletConnectButton() {
  return (
    <div className="bg-card-light dark:bg-card-dark rounded-2xl p-5 border border-gray-100 dark:border-gray-800 mb-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-lg">
            account_balance_wallet
          </span>
        </div>
        <div>
          <h3 className="font-bold text-sm">DEX Wallet</h3>
          <p className="text-text-muted text-xs">
            Connect your wallet for on-chain transactions
          </p>
        </div>
      </div>
      <ConnectButton
        showBalance={true}
        chainStatus="icon"
        accountStatus="address"
      />
    </div>
  );
}
