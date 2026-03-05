import { createPublicClient, http } from "viem";
import { base, baseSepolia } from "viem/chains";

const chain = process.env.NODE_ENV === "production" ? base : baseSepolia;

const rpcUrl =
  process.env.NEXT_PUBLIC_BASE_RPC_URL ||
  (chain === base ? "https://mainnet.base.org" : "https://sepolia.base.org");

export const publicClient = createPublicClient({
  chain,
  transport: http(rpcUrl),
});
