# INFINITV8 Redesign + Full Backend Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Apply the dark/light dual-theme redesign from `infinitv8-redesign/` to the existing Next.js app, build all missing backend APIs (dashboard analytics, portfolio, wallet, transactions, notifications, admin), and deploy to GitHub + Railway.

**Architecture:** Keep the existing Next.js 16 + Prisma + PostgreSQL stack. Add `next-themes` for theme switching. Extend Prisma schema with Transaction, Notification, WalletBalance, YieldPayout, AdminAuditLog, and UserSettings models. Build RESTful API routes under `/api/` for each domain. Admin pages use role-based access control via middleware. The redesign HTML files serve as visual reference — all implementation is in React/Tailwind.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS (class-based dark mode), next-themes, Prisma 7, PostgreSQL, NextAuth, Wagmi/RainbowKit, Zod, Pino

**Key Constraint:** Keep existing 5 projects (SPPS, MDD, KBB, WRP, REI) unchanged. Only apply visual/UI changes + new features.

---

## Phase 1: Theme System Foundation

### Task 1: Install next-themes

**Files:**
- Modify: `package.json`

**Step 1: Install dependency**
```bash
cd "/Users/chemkim/Desktop/Team Claude/INFINITV8"
npm install next-themes
```

**Step 2: Verify installation**
```bash
grep next-themes package.json
```
Expected: `"next-themes": "^0.x.x"`

---

### Task 2: Configure dual-theme Tailwind

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/app/globals.css`

**Step 1: Update tailwind.config.ts**

Replace the entire colors section to support both themes via CSS variables + Tailwind dark mode. Keep `darkMode: "class"` (next-themes will manage the class).

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Semantic tokens that switch per theme
        background: "var(--background)",
        "background-secondary": "var(--background-secondary)",
        "background-tertiary": "var(--background-tertiary)",
        card: "var(--card)",
        "card-hover": "var(--card-hover)",
        border: "var(--border)",
        "border-light": "var(--border-light)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-tertiary": "var(--text-tertiary)",
        "text-muted": "var(--text-muted)",
        // Static brand colors
        primary: "#3b82f6",
        "primary-dark": "#2563eb",
        "primary-darker": "#1d4ed8",
        "primary-light": "#60a5fa",
        "primary-lighter": "#93c5fd",
        accent: "#10b981",
        "accent-dark": "#059669",
        "accent-light": "#34d399",
        destructive: "#ef4444",
        "destructive-dark": "#dc2626",
        amber: "#f59e0b",
        "amber-dark": "#d97706",
        purple: "#8b5cf6",
        "purple-dark": "#7c3aed",
        cyan: "#06b6d4",
      },
      fontFamily: {
        display: ["var(--font-manrope)", "sans-serif"],
        body: ["var(--font-manrope)", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        DEFAULT: "0.75rem",
        sm: "0.5rem",
        lg: "1rem",
        xl: "1.5rem",
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        medium: "var(--shadow-medium)",
        heavy: "var(--shadow-heavy)",
        glow: "0 0 20px rgba(59,130,246,.15)",
        "glow-green": "0 0 20px rgba(16,185,129,.15)",
      },
      animation: {
        fadeIn: "fadeIn 0.3s ease-out",
        fadeUp: "fadeUp 0.6s ease",
        slideRight: "slideRight 0.5s ease",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideRight: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
```

**Step 2: Add CSS variables to globals.css**

Replace `src/app/globals.css` with theme variables for both light and dark:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  /* Light theme (default) */
  :root {
    --background: #f6f6f8;
    --background-secondary: #ffffff;
    --background-tertiary: #f0f0f4;
    --card: #ffffff;
    --card-hover: #f9f9fb;
    --border: #e2e8f0;
    --border-light: #f1f5f9;
    --text-primary: #111827;
    --text-secondary: #4b5563;
    --text-tertiary: #6b7280;
    --text-muted: #9ca3af;
    --shadow-soft: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
    --shadow-medium: 0 10px 25px -3px rgba(0, 0, 0, 0.08);
    --shadow-heavy: 0 25px 50px -12px rgba(0, 0, 0, 0.12);
  }

  /* Dark theme */
  .dark {
    --background: #0a0e1a;
    --background-secondary: #0f1629;
    --background-tertiary: #151d32;
    --card: #111827;
    --card-hover: #1a2332;
    --border: #1e293b;
    --border-light: #2d3a4f;
    --text-primary: #f8fafc;
    --text-secondary: #cbd5e1;
    --text-tertiary: #94a3b8;
    --text-muted: #64748b;
    --shadow-soft: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2);
    --shadow-medium: 0 10px 25px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.3);
    --shadow-heavy: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  }

  * {
    font-family: var(--font-manrope), sans-serif;
  }

  h1 { font-size: 2.25rem; font-weight: 800; line-height: 1.15; letter-spacing: -0.025em; }
  h2 { font-size: 1.75rem; font-weight: 700; line-height: 1.2; }
  h3 { font-size: 1.25rem; font-weight: 700; line-height: 1.3; }
  h4 { font-size: 1rem; font-weight: 600; line-height: 1.4; }
}

@layer utilities {
  .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  .hide-scrollbar::-webkit-scrollbar { display: none; }
  .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
  .pt-safe { padding-top: env(safe-area-inset-top); }
}

/* Material Symbols */
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
.material-symbols-outlined.fill-1 {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
```

**Step 3: Commit**
```bash
git add tailwind.config.ts src/app/globals.css
git commit -m "feat: add dual-theme CSS variables for light/dark mode"
```

---

### Task 3: Theme provider + toggle component

**Files:**
- Modify: `src/components/providers.tsx`
- Create: `src/components/ui/theme-toggle.tsx`
- Modify: `src/app/layout.tsx`

**Step 1: Update providers.tsx to include ThemeProvider**

```tsx
"use client";

import { ThemeProvider } from "next-themes";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/lib/wagmi";
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
            <SessionProvider>{children}</SessionProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}
```

**Step 2: Create theme toggle component**

Create `src/components/ui/theme-toggle.tsx`:

```tsx
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-9 h-9" />;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-lg bg-background-secondary border border-border hover:bg-card-hover transition-colors"
      aria-label="Toggle theme"
    >
      <span className="material-symbols-outlined text-xl text-text-secondary">
        {theme === "dark" ? "light_mode" : "dark_mode"}
      </span>
    </button>
  );
}
```

**Step 3: Update layout.tsx to suppress hydration warning**

Update `<html>` tag to `<html lang="en" suppressHydrationWarning>` (required by next-themes).

Update `<body>` className to use new semantic tokens:
```tsx
className={`${manrope.variable} font-body antialiased bg-background text-text-primary`}
```

**Step 4: Commit**
```bash
git add src/components/providers.tsx src/components/ui/theme-toggle.tsx src/app/layout.tsx
git commit -m "feat: add ThemeProvider with dark/light toggle component"
```

---

## Phase 2: Database Schema Extensions

### Task 4: Add new Prisma models

**Files:**
- Modify: `prisma/schema.prisma`

**Step 1: Add new enums and models to schema.prisma**

Append after existing models:

```prisma
enum TransactionType {
  DEPOSIT
  WITHDRAWAL
  INVESTMENT
  YIELD
  TRANSFER
  FEE
}

enum TransactionStatus {
  PENDING
  COMPLETED
  FAILED
  CANCELLED
}

enum NotificationType {
  YIELD_RECEIVED
  INVESTMENT_CONFIRMED
  KYC_UPDATE
  PAYOUT_SCHEDULED
  SYSTEM
  ADMIN
}

model Transaction {
  id          String            @id @default(cuid())
  userId      String
  type        TransactionType
  asset       String            // e.g. "USDT", "USDC", "ETH", project ticker
  amount      Decimal
  status      TransactionStatus @default(PENDING)
  txHash      String?           // blockchain tx hash
  projectId   String?           // if related to a project investment
  description String?
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  user    User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  project Project? @relation(fields: [projectId], references: [id])

  @@index([userId, createdAt])
  @@index([status])
}

model WalletBalance {
  id        String   @id @default(cuid())
  userId    String
  asset     String   // "USDT", "USDC", "ETH"
  network   String   // "ERC20", "TRC20", etc.
  balance   Decimal  @default(0)
  available Decimal  @default(0)
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, asset, network])
}

model YieldPayout {
  id           String   @id @default(cuid())
  userId       String
  projectId    String
  investmentId String
  amount       Decimal
  payoutDate   DateTime
  paid         Boolean  @default(false)
  paidAt       DateTime?
  createdAt    DateTime @default(now())

  user       User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  project    Project    @relation(fields: [projectId], references: [id])
  investment Investment @relation(fields: [investmentId], references: [id])

  @@index([userId, payoutDate])
  @@index([paid])
}

model Notification {
  id        String           @id @default(cuid())
  userId    String
  type      NotificationType
  title     String
  message   String
  read      Boolean          @default(false)
  data      Json?            // extra context (projectId, amount, etc.)
  createdAt DateTime         @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, read, createdAt])
}

model AdminAuditLog {
  id        String   @id @default(cuid())
  adminId   String
  action    String   // "user.update", "kyc.approve", "project.create", etc.
  target    String?  // target entity ID
  details   Json?
  ipAddress String?
  createdAt DateTime @default(now())

  admin User @relation("AdminAuditLogs", fields: [adminId], references: [id])

  @@index([adminId, createdAt])
}

model UserSettings {
  id                   String  @id @default(cuid())
  userId               String  @unique
  biometricAuth        Boolean @default(false)
  withdrawalWhitelist  Boolean @default(false)
  emailConfirmWithdraw Boolean @default(true)
  antiPhishingCode     String?
  notifyYield          Boolean @default(true)
  notifyInvestment     Boolean @default(true)
  notifySystem         Boolean @default(true)
  theme                String  @default("dark")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

Also add relations to existing User model:
```prisma
model User {
  // ... existing fields ...
  transactions    Transaction[]
  walletBalances  WalletBalance[]
  yieldPayouts    YieldPayout[]
  notifications   Notification[]
  adminAuditLogs  AdminAuditLog[] @relation("AdminAuditLogs")
  settings        UserSettings?
}
```

Add relations to existing Project model:
```prisma
model Project {
  // ... existing fields ...
  transactions Transaction[]
  yieldPayouts YieldPayout[]
}
```

Add relation to existing Investment model:
```prisma
model Investment {
  // ... existing fields ...
  yieldPayouts YieldPayout[]
}
```

**Step 2: Generate and migrate**
```bash
npx prisma migrate dev --name add-transactions-wallet-yield-notifications-admin
```

**Step 3: Commit**
```bash
git add prisma/
git commit -m "feat: add Transaction, WalletBalance, YieldPayout, Notification, AdminAuditLog, UserSettings models"
```

---

### Task 5: Seed sample data for new models

**Files:**
- Modify: `prisma/seed.ts`

**Step 1: Add seed data**

After the existing project seeding, add sample transactions, wallet balances, yield payouts, and notifications. Create a demo user (if not exists) with:
- 3 wallet balances (USDT/ERC20, USDC/ERC20, ETH)
- 8 transactions (mix of deposits, investments, yields, withdrawals)
- 6 yield payouts (past and upcoming)
- 5 notifications

**Step 2: Run seed**
```bash
npx prisma db seed
```

**Step 3: Commit**
```bash
git add prisma/seed.ts
git commit -m "feat: seed sample transactions, wallet balances, yields, notifications"
```

---

## Phase 3: Visual Redesign (All Pages)

### Task 6: Redesign protected layout + sidebar

**Files:**
- Modify: `src/app/(protected)/layout.tsx`
- Modify: `src/components/ui/desktop-sidebar.tsx`
- Modify: `src/components/ui/bottom-nav.tsx`
- Modify: `src/components/ui/header.tsx`
- Modify: `src/lib/constants/navigation.ts`

**Step 1: Update navigation constants**

Add new nav items to match redesign sidebar sections:

```ts
export const navItems = [
  // Overview
  { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { label: "Portfolio", href: "/portfolio", icon: "pie_chart" },
  { label: "Wallet", href: "/wallet", icon: "account_balance_wallet" },
  // Invest
  { label: "Marketplace", href: "/marketplace", icon: "storefront" },
  { label: "Investments", href: "/investments", icon: "travel_explore" },
  // Account
  { label: "Transactions", href: "/transactions", icon: "receipt_long" },
  { label: "KYC", href: "/kyc", icon: "verified_user" },
  { label: "Settings", href: "/profile", icon: "settings" },
];

export const mobileNavItems = [
  { label: "Home", href: "/dashboard", icon: "dashboard" },
  { label: "Invest", href: "/marketplace", icon: "storefront" },
  { label: "Portfolio", href: "/portfolio", icon: "pie_chart" },
  { label: "Wallet", href: "/wallet", icon: "account_balance_wallet" },
  { label: "Profile", href: "/profile", icon: "person" },
];
```

**Step 2: Redesign desktop sidebar**

Match the redesign's sidebar: dark card background, grouped sections (Overview / Invest / Account), active state with primary color highlight, user info at bottom with avatar, ThemeToggle button in sidebar header area, sign out button.

Reference: `infinitv8-redesign/dashboard.html` sidebar section.

**Step 3: Redesign header**

Add: search bar, network indicator, notifications bell with badge, theme toggle button. Match the redesign's header from `dashboard.html`.

**Step 4: Update bottom nav to use mobileNavItems**

**Step 5: Commit**
```bash
git add src/app/\(protected\)/layout.tsx src/components/ui/ src/lib/constants/navigation.ts
git commit -m "feat: redesign sidebar, header, and navigation"
```

---

### Task 7: Redesign landing page

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Rebuild landing page**

Match `infinitv8-redesign/index.html` structure:
- Navigation bar with logo, links, auth buttons
- Hero section with stats (TVL, APY, investors, yield) and CTA
- Features grid (6 cards: fractional tokenization, monitoring, yield, KYC, wallet, security)
- Asset classes section (use existing 5 projects from DB, not the redesign's 6)
- How It Works (4 steps)
- Security & Compliance section
- Supported Networks
- Footer

Use semantic color tokens so it looks great in both light and dark themes. Fetch projects from DB for the asset classes section.

**Step 2: Commit**
```bash
git add src/app/page.tsx
git commit -m "feat: redesign landing page with hero, features, assets, security sections"
```

---

### Task 8: Redesign auth pages

**Files:**
- Modify: `src/app/auth/signin/page.tsx`
- Modify: `src/app/auth/signup/page.tsx`

**Step 1: Redesign sign-in page**

Match `infinitv8-redesign/login.html`:
- Split layout: left branding panel (desktop only) + right form
- Left: logo, headline, bullet features, trust badges
- Right: email/password form, Google OAuth, biometric placeholder, forgot password link
- Legal agreement modal (one-time)
- Responsive: left panel hides on mobile

**Step 2: Redesign sign-up page**

Match `infinitv8-redesign/signup.html`:
- Split layout: left steps + right form
- Left: 4-step process, trust badges
- Right: name, email, password (with strength meter), confirm password, terms checkbox
- Google OAuth button

**Step 3: Commit**
```bash
git add src/app/auth/
git commit -m "feat: redesign auth pages with split layout and trust badges"
```

---

### Task 9: Redesign dashboard

**Files:**
- Modify: `src/app/(protected)/dashboard/page.tsx`
- Create: `src/components/dashboard/metrics-cards.tsx`
- Create: `src/components/dashboard/portfolio-chart.tsx`
- Create: `src/components/dashboard/asset-allocation.tsx`
- Create: `src/components/dashboard/active-investments.tsx`
- Create: `src/components/dashboard/upcoming-payouts.tsx`
- Create: `src/components/dashboard/recent-activity.tsx`
- Create: `src/components/dashboard/market-overview.tsx`

**Step 1: Build dashboard components**

Match `infinitv8-redesign/dashboard.html`:
- Welcome section with date, user name, quick actions (Deposit, Withdraw, Invest)
- Metrics row: Total Balance, Total Yield Earned, Portfolio Value, Avg APY
- Portfolio performance chart (SVG area chart with time range tabs)
- Asset allocation pie/donut chart
- Active investments cards (progress bars, APY, maturity %)
- Upcoming payouts card
- Recent activity list
- Market overview table
- Platform stats bar

All components fetch data from new API routes (built in Phase 4).

**Step 2: Commit**
```bash
git add src/app/\(protected\)/dashboard/ src/components/dashboard/
git commit -m "feat: redesign dashboard with metrics, charts, activity, market overview"
```

---

### Task 10: Redesign portfolio page

**Files:**
- Modify: `src/app/(protected)/portfolio/page.tsx`

**Step 1: Rebuild portfolio page**

Match `infinitv8-redesign/portfolio.html`:
- Portfolio hero card with value, gain %, donut chart
- Portfolio growth chart (SVG area chart with time tabs)
- Performance by asset (bar chart)
- Active investments (detailed cards with maturity progress, metrics grid, next payout)
- Payout history table
- Yield analytics card

**Step 2: Commit**
```bash
git add src/app/\(protected\)/portfolio/
git commit -m "feat: redesign portfolio with charts, yield analytics, payout history"
```

---

### Task 11: Redesign wallet page

**Files:**
- Modify: `src/app/(protected)/wallet/page.tsx`

**Step 1: Rebuild wallet page**

Match `infinitv8-redesign/wallet.html`:
- Wallet hero (total balance, available, invested, action buttons)
- Token balances card (USDT, USDC, ETH with amounts)
- Connected wallet card (MetaMask, address, network, chain ID)
- Security settings (biometric, whitelist, email confirm, anti-phishing, device management)
- Recent transactions table

Integrate with Wagmi for actual wallet state + new WalletBalance API.

**Step 2: Commit**
```bash
git add src/app/\(protected\)/wallet/
git commit -m "feat: redesign wallet with balances, security settings, transactions"
```

---

### Task 12: Create marketplace page

**Files:**
- Create: `src/app/(protected)/marketplace/page.tsx`

**Step 1: Build marketplace**

Match `infinitv8-redesign/marketplace.html`:
- Stats bar (TVL, Avg APY, Total Investors, Yield Distributed)
- Filter chips (All, Real Estate, Agriculture, Healthcare, Commodities)
- Sort dropdown (Highest APY, Lowest APY, Most Funded, Lowest Min, Most Investors)
- Search bar
- Grid/List view toggle
- Project cards (image, APY, badges, funding progress, risk level, invest button)
- Compare feature (select 2-3 projects, floating comparison bar)

Fetch from existing `/api/projects` endpoint.

**Step 2: Commit**
```bash
git add src/app/\(protected\)/marketplace/
git commit -m "feat: add marketplace page with filters, sort, search, compare"
```

---

### Task 13: Redesign KYC pages

**Files:**
- Modify: `src/app/(protected)/kyc/page.tsx`
- Modify: `src/app/(protected)/kyc/verify/page.tsx`
- Modify: `src/app/(protected)/kyc/status/page.tsx`
- Modify: `src/app/(protected)/kyc/status/client.tsx`

**Step 1: Rebuild KYC flow**

Match `infinitv8-redesign/kyc.html`:
- Progress steps (3 levels: Basic → Identity → Enhanced)
- Verification levels with perks per level
- PDPA consent section with 4 checkboxes
- Sumsub SDK container (styled dark)
- Status states: pending (with timer), approved, rejected
- FAQ section

**Step 2: Commit**
```bash
git add src/app/\(protected\)/kyc/
git commit -m "feat: redesign KYC with 3-level verification, PDPA consent, status states"
```

---

### Task 14: Redesign remaining pages

**Files:**
- Modify: `src/app/(protected)/transactions/page.tsx`
- Modify: `src/app/(protected)/profile/page.tsx`
- Modify: `src/app/(protected)/notifications/page.tsx`
- Modify: `src/app/(protected)/investments/page.tsx`
- Modify: `src/app/(protected)/investments/[id]/page.tsx`

**Step 1: Redesign transactions page**

Full transaction history table with columns: Type, Asset, Amount, Status, Date, TX Hash. Add filter tabs (All, Deposits, Withdrawals, Yields, Investments). Search + date range filter.

**Step 2: Redesign profile/settings page**

User info card, settings sections (account, security, notifications, preferences).

**Step 3: Redesign notifications page**

List view with unread indicator, notification types with icons, mark all read button, empty state.

**Step 4: Update investments + detail pages**

Apply new color tokens and card styles to match the redesign's visual language.

**Step 5: Commit**
```bash
git add src/app/\(protected\)/
git commit -m "feat: redesign transactions, profile, notifications, investments pages"
```

---

## Phase 4: Backend APIs

### Task 15: Dashboard analytics API

**Files:**
- Create: `src/app/api/dashboard/route.ts`

**Step 1: Build GET /api/dashboard**

Returns aggregated dashboard data for the authenticated user:

```ts
// Response shape
{
  totalBalance: number,       // wallet balances + investment values
  availableBalance: number,   // wallet available
  investedAmount: number,     // sum of confirmed investments
  totalYieldEarned: number,   // sum of paid yield payouts
  monthlyYield: number,       // yield paid this month
  avgApy: number,             // weighted avg APY across investments
  portfolioGain: number,      // current value - invested
  portfolioGainPct: number,
  activeInvestments: [{       // top investments with progress
    id, projectName, ticker, category, amountInvested,
    currentValue, gainPct, apy, maturityPct, maturityDate
  }],
  upcomingPayouts: [{         // next 5 payouts
    id, projectName, ticker, amount, payoutDate, frequency
  }],
  recentActivity: [{          // last 10 transactions
    id, type, asset, amount, status, date
  }],
  marketOverview: [{          // all projects with stats
    id, name, ticker, apy, tvl, category, weekChange
  }],
  platformStats: {
    tvl, activeProjects, totalInvestors, yieldDistributed
  }
}
```

Queries: User investments with projects, yield payouts, transactions, wallet balances, project aggregates.

**Step 2: Commit**
```bash
git add src/app/api/dashboard/
git commit -m "feat: add dashboard analytics API endpoint"
```

---

### Task 16: Portfolio analytics API

**Files:**
- Create: `src/app/api/portfolio/route.ts`
- Create: `src/app/api/portfolio/history/route.ts`

**Step 1: Build GET /api/portfolio**

Returns detailed portfolio data:
```ts
{
  totalValue: number,
  totalInvested: number,
  totalYieldEarned: number,
  monthlyYield: number,
  avgApy: number,
  unrealizedGain: number,
  projectedAnnualYield: number,
  yieldOnCost: number,
  nextPayoutDate: string,
  assets: [{
    id, investmentId, projectName, ticker, category, location,
    amountInvested, currentValue, gainPct, apy, yieldEarned,
    maturityPct, maturityDate, nextPayout, ownershipPct, status
  }],
  allocation: [{ category, value, percentage }],
  payoutHistory: [{
    id, date, projectName, ticker, amount, status
  }]
}
```

**Step 2: Build GET /api/portfolio/history?range=3m**

Returns portfolio value time series for chart:
```ts
{
  range: "1m" | "3m" | "6m" | "1y" | "all",
  dataPoints: [{ date: string, portfolioValue: number, cumulativeYield: number }]
}
```

Generates data points from transactions + yield payouts over time.

**Step 3: Commit**
```bash
git add src/app/api/portfolio/
git commit -m "feat: add portfolio analytics and history APIs"
```

---

### Task 17: Wallet operations API

**Files:**
- Create: `src/app/api/wallet/route.ts`
- Create: `src/app/api/wallet/deposit/route.ts`
- Create: `src/app/api/wallet/withdraw/route.ts`

**Step 1: Build GET /api/wallet**

Returns wallet data:
```ts
{
  totalBalance: number,
  available: number,
  invested: number,
  balances: [{ asset, network, balance, available, usdValue }],
  connectedWallet: { address, network, chainId, connectedSince } | null,
  securitySettings: { biometricAuth, withdrawalWhitelist, emailConfirmWithdraw, antiPhishingCode, activeDevices },
  recentTransactions: [{ id, type, asset, amount, status, date, txHash }]
}
```

**Step 2: Build POST /api/wallet/deposit**

Creates a pending deposit transaction + updates wallet balance:
```ts
// Request: { asset: string, amount: number, network: string, txHash?: string }
// Response: { transactionId: string, status: "PENDING" }
```

**Step 3: Build POST /api/wallet/withdraw**

Creates a pending withdrawal transaction (with KYC check, whitelist check):
```ts
// Request: { asset: string, amount: number, toAddress: string, network: string }
// Response: { transactionId: string, status: "PENDING" }
```

Validations: sufficient balance, KYC approved, daily withdrawal limit.

**Step 4: Commit**
```bash
git add src/app/api/wallet/
git commit -m "feat: add wallet balance, deposit, and withdraw APIs"
```

---

### Task 18: Transaction history API

**Files:**
- Create: `src/app/api/transactions/route.ts`

**Step 1: Build GET /api/transactions**

Paginated transaction history with filters:
```ts
// Query params: ?type=YIELD&status=COMPLETED&page=1&limit=20&from=2026-01-01&to=2026-03-05
// Response:
{
  transactions: [{ id, type, asset, amount, status, txHash, projectName, description, createdAt }],
  pagination: { page, limit, total, totalPages }
}
```

**Step 2: Commit**
```bash
git add src/app/api/transactions/
git commit -m "feat: add paginated transaction history API"
```

---

### Task 19: Notification API

**Files:**
- Create: `src/app/api/notifications/route.ts`
- Create: `src/app/api/notifications/[id]/route.ts`

**Step 1: Build GET /api/notifications**

```ts
// Query: ?read=false&page=1&limit=20
{
  notifications: [{ id, type, title, message, read, data, createdAt }],
  unreadCount: number,
  pagination: { page, limit, total }
}
```

**Step 2: Build PATCH /api/notifications/[id]**

Mark notification as read: `{ read: true }`

**Step 3: Build PATCH /api/notifications (bulk)**

Mark all as read: `POST /api/notifications` with `{ action: "markAllRead" }`

**Step 4: Commit**
```bash
git add src/app/api/notifications/
git commit -m "feat: add notification list, read, and bulk-read APIs"
```

---

### Task 20: User settings API

**Files:**
- Create: `src/app/api/user/settings/route.ts`

**Step 1: Build GET + PUT /api/user/settings**

```ts
// GET response: UserSettings fields
// PUT request: partial UserSettings update
```

**Step 2: Commit**
```bash
git add src/app/api/user/settings/
git commit -m "feat: add user settings API"
```

---

## Phase 5: Admin Backend + Frontend

### Task 21: Admin middleware

**Files:**
- Create: `src/lib/admin.ts`

**Step 1: Create admin authorization helper**

```ts
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 };
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") {
    return { error: "Forbidden", status: 403 };
  }
  return { userId: session.user.id };
}

export async function auditLog(adminId: string, action: string, target?: string, details?: Record<string, unknown>) {
  await prisma.adminAuditLog.create({
    data: { adminId, action, target, details: details ?? undefined },
  });
}
```

**Step 2: Commit**
```bash
git add src/lib/admin.ts
git commit -m "feat: add admin authorization helper and audit logging"
```

---

### Task 22: Admin API — Users

**Files:**
- Create: `src/app/api/admin/users/route.ts`
- Create: `src/app/api/admin/users/[id]/route.ts`

**Step 1: Build GET /api/admin/users**

Paginated user list with search and filters:
```ts
// Query: ?search=email&role=INVESTOR&kycStatus=APPROVED&page=1&limit=20
{
  users: [{ id, email, name, role, kycStatus, walletAddress, investmentCount, totalInvested, createdAt }],
  pagination: { page, limit, total, totalPages },
  stats: { totalUsers, verifiedUsers, pendingKyc, totalInvested }
}
```

**Step 2: Build GET /api/admin/users/[id]**

Detailed user view with investments, transactions, KYC data.

**Step 3: Build PATCH /api/admin/users/[id]**

Update user role, status. Logs to AdminAuditLog.

**Step 4: Commit**
```bash
git add src/app/api/admin/users/
git commit -m "feat: add admin users API (list, detail, update)"
```

---

### Task 23: Admin API — KYC Queue

**Files:**
- Create: `src/app/api/admin/kyc/route.ts`

**Step 1: Build GET /api/admin/kyc**

```ts
// Query: ?status=PENDING&page=1&limit=20
{
  queue: [{ id, userId, userName, userEmail, status, sumsubApplicantId, createdAt, updatedAt }],
  stats: { pending, approved, rejected, total },
  pagination: { page, limit, total }
}
```

**Step 2: Build PATCH /api/admin/kyc**

Manual KYC status override (with audit log):
```ts
// Request: { userId: string, status: "APPROVED" | "REJECTED", reason?: string }
```

**Step 3: Commit**
```bash
git add src/app/api/admin/kyc/
git commit -m "feat: add admin KYC queue API"
```

---

### Task 24: Admin API — Projects, Transactions, Yield, Audit

**Files:**
- Create: `src/app/api/admin/projects/route.ts`
- Create: `src/app/api/admin/projects/[id]/route.ts`
- Create: `src/app/api/admin/transactions/route.ts`
- Create: `src/app/api/admin/transactions/[id]/route.ts`
- Create: `src/app/api/admin/yield/route.ts`
- Create: `src/app/api/admin/audit/route.ts`

**Step 1: Admin Projects CRUD**
- GET /api/admin/projects — list all with funding stats
- POST /api/admin/projects — create new project
- GET /api/admin/projects/[id] — detail with investors
- PATCH /api/admin/projects/[id] — update project fields
- DELETE /api/admin/projects/[id] — soft delete (set status SOLD_OUT)

**Step 2: Admin Transactions**
- GET /api/admin/transactions — all transactions with user info, filterable
- PATCH /api/admin/transactions/[id] — approve/reject pending transactions

**Step 3: Admin Yield Engine**
- GET /api/admin/yield — yield payout schedule overview
- POST /api/admin/yield/distribute — trigger yield distribution for a project
  - Calculates yield for each investor based on amount × APY × time
  - Creates YieldPayout records
  - Creates Transaction records (type: YIELD)
  - Creates Notification records
  - Updates wallet balances

**Step 4: Admin Audit Log**
- GET /api/admin/audit — paginated audit log with filters

**Step 5: Commit**
```bash
git add src/app/api/admin/
git commit -m "feat: add admin APIs for projects, transactions, yield engine, audit log"
```

---

### Task 25: Admin frontend pages

**Files:**
- Create: `src/app/(protected)/admin/page.tsx`
- Create: `src/app/(protected)/admin/layout.tsx`
- Create: `src/app/(protected)/admin/users/page.tsx`
- Create: `src/app/(protected)/admin/kyc/page.tsx`
- Create: `src/app/(protected)/admin/projects/page.tsx`
- Create: `src/app/(protected)/admin/transactions/page.tsx`
- Create: `src/app/(protected)/admin/yield/page.tsx`
- Create: `src/app/(protected)/admin/audit/page.tsx`

**Step 1: Build admin layout**

Match `infinitv8-redesign/admin.html`:
- Admin-specific sidebar with sections: Overview, Management, Finance, Compliance
- Role check — redirect non-ADMIN users to /dashboard
- Alert banner for pending items

**Step 2: Build admin dashboard (overview)**

- Metrics grid (8 tiles: TVL, deposits, yield, fees, pending KYC, pending transactions, active projects, total users)
- 4-tab view: Pending Transactions, KYC Queue, Compliance Flags, Audit Log
- Tables with action buttons

**Step 3: Build admin sub-pages**

Each page: data table with search/filters, action buttons (approve, reject, edit), detail modals/drawers.

**Step 4: Update middleware.ts**

Add `/admin` routes to require ADMIN role. Add `/api/admin/*` to protected routes.

**Step 5: Commit**
```bash
git add src/app/\(protected\)/admin/ src/middleware.ts
git commit -m "feat: add admin panel with users, KYC, projects, transactions, yield, audit pages"
```

---

## Phase 6: Deployment

### Task 26: Push to GitHub

**Step 1: Review all changes**
```bash
cd "/Users/chemkim/Desktop/Team Claude/INFINITV8"
git status
git diff --stat
```

**Step 2: Final commit if needed**
```bash
git add -A
git commit -m "feat: complete redesign with dual theme, full backend, admin panel"
```

**Step 3: Push**
```bash
git push origin main
```

---

### Task 27: Deploy to Railway

**Step 1: Verify Railway CLI is available**
```bash
railway --version
```

If not installed: `npm install -g @railway/cli`

**Step 2: Link to existing project**
```bash
cd "/Users/chemkim/Desktop/Team Claude/INFINITV8"
railway link
```

**Step 3: Set environment variables**

Ensure all required env vars are set in Railway:
- DATABASE_URL
- NEXTAUTH_SECRET
- NEXTAUTH_URL
- SUMSUB_APP_TOKEN, SUMSUB_SECRET_KEY
- UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
- NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
- GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

**Step 4: Deploy**
```bash
railway up
```

Or trigger deploy via git push (if Railway is connected to GitHub repo).

**Step 5: Run migrations on Railway**
```bash
railway run npx prisma migrate deploy
railway run npx prisma db seed
```

**Step 6: Verify deployment**
```bash
railway open
```

Check: landing page loads, auth works, dashboard renders, admin panel accessible.

**Step 7: Commit deployment config if needed**
```bash
git add .
git commit -m "chore: finalize deployment configuration"
git push origin main
```

---

## Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| 1 | 1-3 | Theme system (next-themes, CSS variables, toggle) |
| 2 | 4-5 | Database schema + seed data |
| 3 | 6-14 | Visual redesign (all pages) |
| 4 | 15-20 | Backend APIs (dashboard, portfolio, wallet, transactions, notifications, settings) |
| 5 | 21-25 | Admin backend + frontend |
| 6 | 26-27 | GitHub push + Railway deployment |

**Total: 27 tasks across 6 phases.**
