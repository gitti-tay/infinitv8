"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", icon: "home", label: "Home" },
  { href: "/investments", icon: "travel_explore", label: "Invest" },
  { href: "/portfolio", icon: "pie_chart", label: "Portfolio" },
  { href: "/wallet", icon: "account_balance_wallet", label: "Wallet" },
  { href: "/profile", icon: "person", label: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 w-full bg-card-light dark:bg-card-dark border-t border-gray-200 dark:border-gray-800 z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-text-muted dark:text-gray-400 hover:text-primary"
              }`}
            >
              <span
                className={`material-symbols-outlined text-2xl mb-1 ${isActive ? "fill-1" : ""}`}
              >
                {item.icon}
              </span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
