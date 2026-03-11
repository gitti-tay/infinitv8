/** Detect if running inside a wallet's in-app browser (MetaMask, TrustWallet, etc.) */
export function isInAppBrowser(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent.toLowerCase();
  return (
    ua.includes("metamask") ||
    ua.includes("trust") ||
    ua.includes("coinbase") ||
    ua.includes("rainbow") ||
    // Generic WebView indicators
    ua.includes("wv") ||
    ua.includes("webview")
  );
}
