"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { sidebarNavItems } from "@/lib/constants/navigation";
import { ThemeToggle } from "./theme-toggle";

export function DesktopSidebar() {
  const pathname = usePathname();

  const sections = sidebarNavItems.reduce((acc, item) => {
    const section = item.section || "Other";
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {} as Record<string, typeof sidebarNavItems>);

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-card border-r border-border z-30">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-white font-bold text-lg">&infin;</span>
        </div>
        <div>
          <span className="font-bold text-text-primary text-lg">INFINITV8</span>
        </div>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto hide-scrollbar">
        {Object.entries(sections).map(([section, items]) => (
          <div key={section} className="mb-6">
            <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
              {section}
            </p>
            <div className="space-y-1">
              {items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-text-secondary hover:bg-background-tertiary hover:text-text-primary"
                    }`}
                  >
                    <span className={`material-symbols-outlined text-xl ${isActive ? "fill-1" : ""}`}>
                      {item.icon}
                    </span>
                    {item.label}
                    {item.badge && (
                      <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-border">
        <Link
          href="/profile"
          className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-background-tertiary transition-colors"
        >
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-primary text-sm font-bold">JK</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">Jun Kang</p>
            <p className="text-xs text-text-muted">Verified Investor</p>
          </div>
        </Link>
      </div>
    </aside>
  );
}
