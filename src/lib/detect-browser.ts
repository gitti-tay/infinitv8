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

/** Detect if running on iOS (iPhone/iPad/iPod, including iPadOS 13+ which spoofs macOS) */
export function isIOSBrowser(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return true;
  // iPadOS 13+ reports as macOS in UA; detect via Mac platform + touch
  return /macintosh/.test(ua) && navigator.maxTouchPoints > 1;
}

/** Detect if running on a mobile device (phone or tablet) */
export function isMobileBrowser(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent.toLowerCase();
  return (
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(ua) ||
    (navigator.maxTouchPoints > 0 && window.innerWidth < 1024)
  );
}
