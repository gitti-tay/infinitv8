export type NavItem = {
  label: string;
  href: string;
  icon: string;
  section?: string;
  badge?: string;
};

export const sidebarNavItems: NavItem[] = [
  // Overview
  { label: "Dashboard", href: "/dashboard", icon: "dashboard", section: "Overview" },
  { label: "Portfolio", href: "/portfolio", icon: "pie_chart", section: "Overview" },
  { label: "Wallet", href: "/wallet", icon: "account_balance_wallet", section: "Overview" },
  // Invest
  { label: "Marketplace", href: "/marketplace", icon: "storefront", section: "Invest" },
  { label: "Investments", href: "/investments", icon: "travel_explore", section: "Invest" },
  // Account
  { label: "Transactions", href: "/transactions", icon: "receipt_long", section: "Account" },
  { label: "KYC", href: "/kyc", icon: "verified_user", section: "Account" },
  { label: "Settings", href: "/profile", icon: "settings", section: "Account" },
];

export const mobileNavItems: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: "dashboard" },
  { label: "Invest", href: "/marketplace", icon: "storefront" },
  { label: "Portfolio", href: "/portfolio", icon: "pie_chart" },
  { label: "Wallet", href: "/wallet", icon: "account_balance_wallet" },
  { label: "Profile", href: "/profile", icon: "person" },
];
