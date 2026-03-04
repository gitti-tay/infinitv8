"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/constants/navigation";

export function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-card-light dark:bg-card-dark border-r border-gray-200 dark:border-gray-800 flex-col z-50">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-800">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-glow">
            <span className="material-symbols-outlined text-white text-xl">
              account_balance_wallet
            </span>
          </div>
          <span className="text-xl font-bold tracking-tight">INFINITV8</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-text-muted hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary"
              }`}
            >
              <span
                className={`material-symbols-outlined text-xl ${isActive ? "fill-1" : ""}`}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}

        <Link
          href="/notifications"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
            pathname.startsWith("/notifications")
              ? "bg-primary/10 text-primary"
              : "text-text-muted hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary"
          }`}
        >
          <span className="material-symbols-outlined text-xl">
            notifications
          </span>
          Notifications
        </Link>
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
        <p className="text-[10px] text-text-muted">INFINITV8 v1.0.0</p>
      </div>
    </aside>
  );
}
