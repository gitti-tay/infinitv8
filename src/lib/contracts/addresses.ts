/**
 * Contract addresses and chain configuration for INFINITV8 on Base.
 */

export const CONTRACTS = {
  8453: {
    // Base mainnet
    investment: (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
      "0x232738784fa4988d21a20f575ae53f28625eb1f5") as `0x${string}`,
    usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as `0x${string}`,
    usdt: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2" as `0x${string}`,
  },
  84532: {
    // Base Sepolia
    investment: (process.env.NEXT_PUBLIC_TESTNET_CONTRACT_ADDRESS ||
      "0x6ce394872552FcD22c2DA1E63A6d4F106bB1E801") as `0x${string}`,
    usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as `0x${string}`, // Circle test USDC on Base Sepolia
    usdt: "0x" as `0x${string}`, // Placeholder for testnet
  },
} as const;

export const BASE_CHAIN_ID = 8453;
export const BASE_SEPOLIA_CHAIN_ID = 84532;
export const BASESCAN_URL = "https://basescan.org";
export const BASESCAN_SEPOLIA_URL = "https://sepolia.basescan.org";

export function getContracts(chainId: number) {
  return CONTRACTS[chainId as keyof typeof CONTRACTS] ?? CONTRACTS[8453];
}

export function getBasescanUrl(chainId: number) {
  return chainId === 84532 ? BASESCAN_SEPOLIA_URL : BASESCAN_URL;
}
