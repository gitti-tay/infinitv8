"use client";

import { useAccount, useSwitchChain } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { BASE_CHAIN_ID } from "@/lib/contracts/addresses";

interface WalletCheckStepProps {
  onContinue: () => void;
  onBack: () => void;
}

export function WalletCheckStep({ onContinue, onBack }: WalletCheckStepProps) {
  const { address, isConnected, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();

  const isOnBase = chainId === BASE_CHAIN_ID || chainId === 84532;
  const isReady = isConnected && isOnBase;

  async function handleSwitchNetwork() {
    try {
      await switchChainAsync({ chainId: BASE_CHAIN_ID });
    } catch {
      // User rejected or error — no action needed
    }
  }

  return (
    <div className="space-y-5">
      <div className="text-center mb-2">
        <h2 className="text-lg font-extrabold tracking-tight text-text-primary">
          Connect Wallet
        </h2>
        <p className="text-sm text-text-muted">
          Connect your wallet on Base network to proceed
        </p>
      </div>

      {/* Connected + correct network */}
      {isReady && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-accent text-3xl">account_balance_wallet</span>
          </div>
          <h3 className="font-bold text-lg text-green-900 dark:text-green-100 mb-1">
            Wallet Connected
          </h3>
          <p className="text-sm text-green-700 dark:text-green-400 mb-2">
            Connected to Base network
          </p>
          <p className="text-xs font-mono text-text-muted bg-background-secondary rounded-lg px-3 py-2 inline-block">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>
      )}

      {/* Connected but wrong network */}
      {isConnected && !isOnBase && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-amber-500 text-3xl">swap_horiz</span>
          </div>
          <h3 className="font-bold text-lg text-amber-900 dark:text-amber-100 mb-1">
            Wrong Network
          </h3>
          <p className="text-sm text-amber-700 dark:text-amber-400 mb-4">
            Your wallet is connected but not on the Base network. Please switch to continue.
          </p>
          <button
            onClick={handleSwitchNetwork}
            className="inline-flex items-center gap-1.5 px-6 py-3 bg-amber-600 text-white text-sm font-bold rounded-lg hover:bg-amber-700 transition-colors"
          >
            <span className="material-symbols-outlined text-base">swap_horiz</span>
            Switch to Base
          </button>
        </div>
      )}

      {/* Not connected */}
      {!isConnected && (
        <div className="bg-card-light dark:bg-card-dark border border-gray-100 dark:border-gray-800 rounded-xl p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-primary text-3xl">account_balance_wallet</span>
          </div>
          <h3 className="font-bold text-lg text-text-primary mb-1">
            Wallet Required
          </h3>
          <p className="text-sm text-text-muted mb-5">
            Connect your crypto wallet to invest on-chain. Your investment will be secured by smart contracts on the Base network.
          </p>
          <div className="flex justify-center">
            <ConnectButton />
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-4 border border-primary/20">
        <div className="flex gap-3">
          <span className="material-symbols-outlined text-primary text-lg mt-0.5">info</span>
          <p className="text-xs text-text-muted leading-relaxed">
            INFINITV8 uses the Base network (Ethereum L2) for all on-chain investments.
            An ERC-1155 token will be minted to your wallet representing your investment,
            verifiable on Basescan.
          </p>
        </div>
      </div>

      {/* CTAs */}
      <div className="fixed bottom-16 md:bottom-0 left-0 md:left-64 right-0 z-40">
        <div className="max-w-5xl mx-auto px-5 pb-4 pt-3 bg-gradient-to-t from-bg-light dark:from-bg-dark flex gap-3">
          <button
            onClick={onBack}
            className="px-6 py-3.5 border border-border rounded-xl text-sm font-semibold text-text-secondary hover:bg-background-secondary transition-colors"
          >
            Back
          </button>
          {isReady && (
            <button
              onClick={onContinue}
              className="flex-1 py-3.5 bg-primary text-white text-center font-bold rounded-xl shadow-glow hover:bg-primary-dark transition-colors"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
