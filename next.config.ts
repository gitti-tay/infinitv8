import type { NextConfig } from "next";
import path from "path";

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.sumsub.com",
      "connect-src 'self' https://api.sumsub.com https://*.upstash.io wss://*.walletconnect.com https://*.walletconnect.com https://rpc.walletconnect.com https://*.infura.io https://*.alchemy.com",
      "img-src 'self' data: blob: https:",
      "font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "frame-src 'self' https://verify.walletconnect.com",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  experimental: {
    nodeMiddleware: true,
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
