"use client";

import { ThemeProvider } from "next-themes";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/lib/wagmi";
import { WalletSync } from "@/components/wallet/wallet-sync";
import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            theme={{
              lightMode: lightTheme({
                accentColor: "#3b82f6",
                accentColorForeground: "white",
                borderRadius: "large",
              }),
              darkMode: darkTheme({
                accentColor: "#3b82f6",
                accentColorForeground: "white",
                borderRadius: "large",
              }),
            }}
          >
            <SessionProvider>
              <WalletSync />
              {children}
            </SessionProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}
