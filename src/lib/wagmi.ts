import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { arbitrum, base, mainnet, optimism, polygon } from "wagmi/chains";

const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "placeholder";

export const wagmiConfig = getDefaultConfig({
  appName: "INFINITV8",
  projectId,
  chains: [mainnet, polygon, arbitrum, optimism, base],
  ssr: true,
});
