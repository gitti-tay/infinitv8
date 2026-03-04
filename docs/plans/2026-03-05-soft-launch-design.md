# INFINITV8 Soft Launch — Implementation Plan

## Context

INFINITV8 is a tokenized RWA investment platform (Next.js 16 + Prisma 7 + PostgreSQL on Railway). The Web2 backend is complete (auth, admin panel, 30+ APIs, KYC via Sumsub), but it has **zero blockchain infrastructure** — no smart contracts, no on-chain tokens, no deposit verification. Many pages show hardcoded sample data instead of calling real APIs. The goal is to make the platform **fully functional for a real soft launch** with this end-to-end flow:

```
Sign Up → Connect Wallet → KYC (Sumsub) → Browse Projects → Invest (pay USDC/USDT/ETH directly from wallet) → ERC-1155 token minted → Visible on Basescan
```

**Key decisions:**
- Chain: **Base** (Coinbase L2, low fees)
- Token: **ERC-1155** (one tokenId per project, amount = USD invested at 6 decimals)
- Payment: **Direct investment** — no platform balance. User pays from wallet at invest time.
- Assets: **USDC, USDT, ETH** on Base
- Verification: **Basescan** — all tokens/transactions publicly verifiable
- Treasury: User has a wallet ready

---

## Phase 1: Smart Contract (ERC-1155 on Base)

### Task 1.1: Set up Foundry project
- Create `contracts/` directory with `foundry.toml`
- Install OpenZeppelin contracts (`forge install OpenZeppelin/openzeppelin-contracts`)
- Configure Base and Base Sepolia in foundry.toml

### Task 1.2: Write `INFINITV8Investment.sol`
**File:** `contracts/src/INFINITV8Investment.sol`

ERC-1155 contract inheriting: `ERC1155`, `AccessControl`, `Pausable`, `ReentrancyGuard`

**Roles:** `DEFAULT_ADMIN_ROLE`, `MANAGER_ROLE`, `TREASURY_ROLE`

**State:**
- `treasury` address (receives all funds)
- `projects` mapping: `uint256 projectId → { active, minInvestment, totalRaised, targetAmount }`
- `acceptedTokens` mapping: `address → bool` (USDC, USDT)
- `ethAccepted` bool, `ethPriceUsd` uint256 (6 decimals, admin-set)
- `userInvestment` mapping: `address → projectId → totalUSD`

**Core functions:**
- `invest(uint256 projectId, address paymentToken, uint256 amount)` — for USDC/USDT. Uses `SafeERC20.safeTransferFrom` to send to treasury. Mints ERC-1155 tokens 1:1 with USD amount. Emits `InvestmentMade` event.
- `investETH(uint256 projectId) payable` — for ETH. Converts to USD via `ethPriceUsd`. Forwards ETH to treasury. Mints ERC-1155.
- Admin: `configureProject`, `setTreasury`, `setAcceptedToken`, `setEthPrice`, `setEthAccepted`, `pause/unpause`, `withdrawToTreasury`

**Token URI:** Returns `https://infinitv8.com/api/token-metadata/{id}`

### Task 1.3: Write contract tests
**File:** `contracts/test/INFINITV8Investment.t.sol`
- Test invest with USDC, USDT, ETH
- Test access control (only MANAGER can configure)
- Test edge cases (below min, exceeds target, paused, inactive project)
- Test reentrancy protection

### Task 1.4: Write deployment script
**File:** `contracts/script/Deploy.s.sol`
- Deploy contract, set treasury, accept USDC/USDT, configure projects

### Task 1.5: Deploy to Base Sepolia (testnet)
```bash
forge script script/Deploy.s.sol --rpc-url https://sepolia.base.org --broadcast --verify
```

---

## Phase 2: Contract Integration Layer

### Task 2.1: Create contract ABI and addresses
**Files:**
- `src/lib/contracts/abi.ts` — ABI exported from Foundry compilation
- `src/lib/contracts/addresses.ts` — contract + token addresses per chain

```ts
// addresses.ts
export const CONTRACTS = {
  8453: { // Base mainnet
    investment: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
    usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const,
    usdt: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2" as const,
  },
  84532: { // Base Sepolia
    investment: process.env.NEXT_PUBLIC_TESTNET_CONTRACT_ADDRESS as `0x${string}`,
    usdc: "0x..." as const, // testnet USDC
    usdt: "0x..." as const,
  },
};
```

### Task 2.2: Create custom hooks
**Files:**
- `src/hooks/useInvestment.ts` — encapsulates approve → invest flow (handles USDC/USDT approval + invest call, ETH invest call, tx status tracking)
- `src/hooks/useTokenBalance.ts` — reads USDC/USDT/ETH balance from connected wallet on Base
- `src/hooks/useInvestmentTokens.ts` — reads ERC-1155 balances from contract

### Task 2.3: Create server-side viem client
**File:** `src/lib/contracts/client.ts`
- `publicClient` for reading events and verifying transactions
- `getAdminWalletClient()` for backend admin operations (uses `CONTRACT_ADMIN_PRIVATE_KEY`)

### Task 2.4: Update wagmi config
**File:** `src/lib/wagmi.ts`
- Set Base as primary chain (first in array)
- Add dedicated RPC: `[base.id]: http(process.env.NEXT_PUBLIC_BASE_RPC_URL)`
- Add Base Sepolia for testnet

---

## Phase 3: Investment Flow (Frontend + Backend)

### Task 3.1: Create transaction progress component
**File:** `src/components/investment/transaction-progress.tsx`
- Multi-step UI: idle → switching-network → approving → approval-confirming → investing → invest-confirming → recording → success
- Error states with retry

### Task 3.2: Create payment selector component
**File:** `src/components/investment/payment-selector.tsx`
- USDC / USDT / ETH radio buttons
- Shows live wallet balance for each asset
- Highlights insufficient balance

### Task 3.3: Create network guard component
**File:** `src/components/investment/network-guard.tsx`
- Checks if wallet is on Base, shows "Switch to Base" button if not
- Uses `useSwitchChain` from wagmi

### Task 3.4: Rewrite investment review page
**File:** `src/app/(protected)/investments/[id]/invest/review/page.tsx`
- Replace plain API call with wallet transaction flow
- Integrate `useInvestment` hook (approve + invest)
- Add payment selector, network guard, transaction progress
- Handle all error states (wrong network, insufficient balance, rejected tx)

### Task 3.5: Update success page with Basescan link
**File:** `src/app/(protected)/investments/[id]/invest/success/page.tsx`
- Accept `txHash` as search param
- Show "View on Basescan" link: `https://basescan.org/tx/${txHash}`

### Task 3.6: Update POST /api/investments
**File:** `src/app/api/investments/route.ts`
- Accept `txHash`, `asset`, `network` in request body
- Verify transaction on-chain via `publicClient.getTransactionReceipt`
- Parse `InvestmentMade` event from logs
- Check txHash not already used (prevent double-recording)
- Create Investment + Transaction records in Prisma transaction
- Update project `raisedPercent`

### Task 3.7: Schema migration
**File:** `prisma/schema.prisma`
- Add `chainProjectId Int? @unique` to `Project` model
- Add `txHash String?`, `asset String?`, `network String?` to `Investment` model
- Run `prisma migrate dev --name add-chain-fields`

### Task 3.8: Create token metadata API
**File:** `src/app/api/token-metadata/[id]/route.ts`
- Returns ERC-1155 metadata JSON (name, description, image, properties)
- Looks up project by `chainProjectId`
- Add to middleware matcher as public route

---

## Phase 4: Wire Hardcoded Pages to Real APIs

### Task 4.1: Fix Dashboard page
**File:** `src/app/(protected)/dashboard/page.tsx`
- Replace hardcoded `metrics` object (line ~48) with real Prisma queries
- Replace hardcoded `activeInvestments` (line ~63) with real investment data
- Replace hardcoded `upcomingPayouts` (line ~109) with real YieldPayout records
- Update `RecentActivity` component (`src/components/dashboard/recent-activity.tsx`) to accept props instead of using hardcoded data

### Task 4.2: Fix Transactions page
**File:** `src/app/(protected)/transactions/page.tsx`
- Replace `SAMPLE_TRANSACTIONS` constant with real Prisma query
- Add Basescan links for transactions with txHash
- Existing `GET /api/transactions` route already supports pagination/filtering

### Task 4.3: Fix Portfolio page
**File:** `src/app/(protected)/portfolio/page.tsx`
- Replace `SAMPLE_PAYOUTS` constant with real YieldPayout query
- Investment cards already use real data (keep as-is)
- Fix yield calculation (currently assumes 100% APY earned)

### Task 4.4: Create WalletSync component
**File:** `src/components/wallet/wallet-sync.tsx`
- Watches `useAccount()` from wagmi
- On wallet connect/change, calls `POST /api/user/wallet` to persist address
- Mount in protected layout (`src/app/(protected)/layout.tsx`)

---

## Phase 5: Wallet Page Redesign

### Task 5.1: Rewrite wallet page
**File:** `src/app/(protected)/wallet/page.tsx`
- Replace hardcoded `TOKENS` and `TRANSACTIONS` with real data
- **Section 1:** Connected wallet info (address, Basescan link, network)
- **Section 2:** On-chain balances (USDC, USDT, ETH on Base via wagmi hooks)
- **Section 3:** ERC-1155 investment token holdings (per project, with Basescan links)
- **Section 4:** Transaction history from `GET /api/transactions`
- **Section 5:** Keep existing security settings
- Remove dead Deposit/Withdraw/Transfer/QR buttons
- Add "Invest Now" CTA linking to `/investments`

---

## Phase 6: Deployment & Operations

### Task 6.1: Environment variables (Railway)
Add: `NEXT_PUBLIC_CONTRACT_ADDRESS`, `NEXT_PUBLIC_BASE_RPC_URL`, `NEXT_PUBLIC_USDC_ADDRESS`, `NEXT_PUBLIC_USDT_ADDRESS`, `TREASURY_WALLET_ADDRESS`, `CONTRACT_ADMIN_PRIVATE_KEY`, `BASESCAN_API_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_URL=https://infinitv8.com`

### Task 6.2: Update CSP headers
**File:** `next.config.ts`
- Add `https://mainnet.base.org https://sepolia.base.org` to `connect-src`

### Task 6.3: Deploy contract to Base mainnet
- Same Foundry script, mainnet RPC
- Configure projects on-chain via `cast` calls
- Verify on Basescan

### Task 6.4: Sumsub production credentials
- Register webhook URL: `https://infinitv8.com/api/kyc/webhook`
- Update `SUMSUB_APP_TOKEN` and `SUMSUB_SECRET_KEY` on Railway

### Task 6.5: Google OAuth production
- Create OAuth client in Google Cloud Console
- Set redirect URI: `https://infinitv8.com/api/auth/callback/google`
- Add credentials to Railway

### Task 6.6: Run Prisma migration on Railway
```bash
prisma migrate deploy
```

---

## Verification

### Testnet (Base Sepolia) — full user journey:
1. Sign up → dashboard loads with empty state
2. Connect MetaMask → address saved to DB
3. Complete KYC via Sumsub sandbox
4. Browse marketplace → select project → enter amount
5. Select USDC → approve → invest → tx confirmed on-chain
6. Success page with Basescan link → click to verify
7. Portfolio shows investment with real data
8. Wallet page shows ERC-1155 token balance
9. Transactions page shows investment tx with Basescan link
10. Dashboard metrics reflect real investment

### Mainnet checklist:
- [ ] Contract deployed and verified on Basescan
- [ ] All env vars set on Railway
- [ ] Sumsub production credentials active
- [ ] Google OAuth working
- [ ] NEXTAUTH_URL = https://infinitv8.com
- [ ] CSP allows Base RPC domains
- [ ] No hardcoded data visible on any page
- [ ] Full user journey passes end-to-end

---

## Critical Files Summary

| File | Change |
|------|--------|
| `contracts/src/INFINITV8Investment.sol` | **NEW** — ERC-1155 smart contract |
| `contracts/test/INFINITV8Investment.t.sol` | **NEW** — Contract tests |
| `contracts/script/Deploy.s.sol` | **NEW** — Deployment script |
| `src/lib/contracts/abi.ts` | **NEW** — Contract ABI |
| `src/lib/contracts/addresses.ts` | **NEW** — Contract/token addresses |
| `src/lib/contracts/client.ts` | **NEW** — Server-side viem client |
| `src/hooks/useInvestment.ts` | **NEW** — Approve + invest hook |
| `src/hooks/useTokenBalance.ts` | **NEW** — On-chain balance hook |
| `src/hooks/useInvestmentTokens.ts` | **NEW** — ERC-1155 balance hook |
| `src/components/investment/transaction-progress.tsx` | **NEW** — Multi-step tx UI |
| `src/components/investment/payment-selector.tsx` | **NEW** — Asset selection |
| `src/components/investment/network-guard.tsx` | **NEW** — Chain check |
| `src/components/wallet/wallet-sync.tsx` | **NEW** — Persist wallet address |
| `src/app/api/token-metadata/[id]/route.ts` | **NEW** — ERC-1155 metadata |
| `src/app/(protected)/investments/[id]/invest/review/page.tsx` | **REWRITE** — On-chain tx flow |
| `src/app/(protected)/investments/[id]/invest/success/page.tsx` | **MODIFY** — Add Basescan link |
| `src/app/api/investments/route.ts` | **MODIFY** — On-chain verification |
| `src/app/(protected)/dashboard/page.tsx` | **MODIFY** — Real data |
| `src/components/dashboard/recent-activity.tsx` | **MODIFY** — Accept props |
| `src/app/(protected)/transactions/page.tsx` | **MODIFY** — Real data |
| `src/app/(protected)/portfolio/page.tsx` | **MODIFY** — Real payouts |
| `src/app/(protected)/wallet/page.tsx` | **REWRITE** — On-chain balances |
| `src/lib/wagmi.ts` | **MODIFY** — Base primary, dedicated RPC |
| `prisma/schema.prisma` | **MODIFY** — Add chainProjectId, investment tx fields |
| `src/middleware.ts` | **MODIFY** — Add token-metadata to public routes |
| `next.config.ts` | **MODIFY** — CSP for Base RPC |
