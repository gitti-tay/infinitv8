"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { sidebarNavItems } from "@/lib/constants/navigation";
import { ThemeToggle } from "./theme-toggle";
import { LogOut } from "lucide-react";

interface DesktopSidebarProps {
  userName: string;
  userEmail: string;
}

export function DesktopSidebar({ userName, userEmail }: DesktopSidebarProps) {
  const pathname = usePathname();

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  const sections = sidebarNavItems.reduce((acc, item) => {
    const section = item.section || "Other";
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {} as Record<string, typeof sidebarNavItems>);

  return (
    <aside className="hidden md:flex md:flex-col md:w-[240px] md:fixed md:inset-y-0 bg-card border-r border-border z-30">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-purple flex items-center justify-center shadow-glow">
          <span className="text-white font-bold text-base">&infin;</span>
        </div>
        <span className="font-bold text-text-primary text-base tracking-tight">
          INFINIT<span className="gradient-text">V8</span>
        </span>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto hide-scrollbar">
        {Object.entries(sections).map(([section, items]) => (
          <div key={section} className="mb-5">
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
              {section}
            </p>
            <div className="space-y-0.5">
              {items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-text-secondary hover:bg-background-tertiary hover:text-text-primary"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
                    )}
                    <span className={`material-symbols-outlined text-[20px] ${isActive ? "fill-1" : ""}`}>
                      {item.icon}
                    </span>
                    {item.label}
                    {item.badge && (
                      <span className="ml-auto px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-primary/10 text-primary">
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

      {/* Footer — User Profile + Sign Out */}
      <div className="px-3 py-3 border-t border-border">
        <Link
          href="/profile"
          className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-background-tertiary transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-purple/20 flex items-center justify-center ring-1 ring-border">
            <span className="text-primary text-xs font-bold">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-text-primary truncate">{userName}</p>
            <p className="text-[11px] text-text-muted truncate">{userEmail}</p>
          </div>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/auth/signin" })}
          className="flex items-center gap-2 w-full px-3 py-2 mt-0.5 rounded-lg text-[13px] text-text-muted hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
