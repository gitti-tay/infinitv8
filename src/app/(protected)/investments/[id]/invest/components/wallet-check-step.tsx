"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useAccount, useSwitchChain } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { BASE_CHAIN_ID } from "@/lib/contracts/addresses";
import { isMobileBrowser, isInAppBrowser, isIOSBrowser } from "@/lib/detect-browser";

interface WalletCheckStepProps {
  onContinue: () => void;
  onBack: () => void;
}

export function WalletCheckStep({ onContinue, onBack }: WalletCheckStepProps) {
  const { address, isConnected, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMobile, setIsMobile] = useState(false);
  const [isWalletBrowser, setIsWalletBrowser] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    setIsMobile(isMobileBrowser());
    setIsWalletBrowser(isInAppBrowser());
    setIsIOS(isIOSBrowser());
  }, []);

  const isOnBase = chainId === BASE_CHAIN_ID || chainId === 84532;
  const isReady = isConnected && isOnBase;

  // On mobile (not in a wallet's in-app browser), show direct deep links
  const showMobileDeepLinks = isMobile && !isWalletBrowser && !isConnected;
  const qs = searchParams.toString();
  const fullPath = qs ? `${pathname}?${qs}` : pathname;
  const host = typeof window !== "undefined" ? window.location.host : "infinitv8.com";
  const dappUrl = `${host}${fullPath}`;

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

      {/* Not connected — mobile deep links */}
      {showMobileDeepLinks && (
        <div className="bg-card-light dark:bg-card-dark border border-gray-100 dark:border-gray-800 rounded-xl p-6">
          <div className="text-center mb-5">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-primary text-3xl">account_balance_wallet</span>
            </div>
            <h3 className="font-bold text-lg text-text-primary mb-1">
              Open in Wallet App
            </h3>
            <p className="text-sm text-text-muted">
              Tap your wallet below to connect and invest directly
            </p>
          </div>

          <div className="space-y-3">
            <a
              href={`https://link.metamask.io/dapp/${dappUrl}`}
              className="flex items-center gap-3 w-full p-4 rounded-xl border border-border bg-background-secondary hover:bg-background-tertiary hover:border-primary/30 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-[#F6851B]/10 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6" viewBox="0 0 35 33" fill="none"><path d="M32.96 1l-13.14 9.72 2.45-5.73L32.96 1z" fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round"/><path d="M2.66 1l13.02 9.81L13.35 4.99 2.66 1z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/><path d="M28.23 23.53l-3.5 5.34 7.49 2.06 2.14-7.28-6.13-.12z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/><path d="M1.27 23.65l2.13 7.28 7.47-2.06-3.48-5.34-6.12.12z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm text-text-primary">MetaMask</p>
                <p className="text-xs text-text-muted">Open in MetaMask app</p>
              </div>
              <span className="material-symbols-outlined text-text-muted text-lg">open_in_new</span>
            </a>

            {/* Trust Wallet deep link only works on Android (removed from iOS in 2021) */}
            {!isIOS && (
              <a
                href={`https://link.trustwallet.com/open_url?coin_id=60&url=${encodeURIComponent(`https://${dappUrl}`)}`}
                className="flex items-center gap-3 w-full p-4 rounded-xl border border-border bg-background-secondary hover:bg-background-tertiary hover:border-primary/30 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[#3375BB]/10 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" viewBox="0 0 40 40" fill="none"><path d="M20 4L6 10v10c0 9.33 5.97 18.06 14 20 8.03-1.94 14-10.67 14-20V10L20 4z" fill="#3375BB"/><path d="M20 8l-10 4.29v7.14c0 6.67 4.27 12.9 10 14.29 5.73-1.39 10-7.62 10-14.29v-7.14L20 8z" fill="white"/></svg>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-text-primary">Trust Wallet</p>
                  <p className="text-xs text-text-muted">Open in Trust Wallet app</p>
                </div>
                <span className="material-symbols-outlined text-text-muted text-lg">open_in_new</span>
              </a>
            )}
          </div>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-text-muted uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="flex justify-center">
            <ConnectButton />
          </div>
        </div>
      )}

      {/* Not connected — desktop or in-app browser (RainbowKit only) */}
      {!isConnected && !showMobileDeepLinks && (
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
