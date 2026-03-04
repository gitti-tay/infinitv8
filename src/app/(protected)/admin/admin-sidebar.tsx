"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  href: string;
  icon: string;
  badge?: number;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const adminNavSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", icon: "speed" },
    ],
  },
  {
    title: "Management",
    items: [
      { label: "Users", href: "/admin/users", icon: "group" },
      { label: "KYC Queue", href: "/admin/kyc", icon: "id_card" },
      { label: "Projects", href: "/admin/projects", icon: "business_center" },
      { label: "Transactions", href: "/admin/transactions", icon: "receipt_long" },
    ],
  },
  {
    title: "Finance",
    items: [
      { label: "Yield Engine", href: "/admin/yield", icon: "payments" },
    ],
  },
  {
    title: "Compliance",
    items: [
      { label: "Audit Log", href: "/admin/audit", icon: "history" },
    ],
  },
];

export function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  const initials = adminName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="hidden md:flex md:flex-col md:w-60 md:fixed md:inset-y-0 bg-card border-r border-border z-30">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border">
        <div className="w-8 h-8 rounded-md bg-gradient-to-br from-destructive to-amber flex items-center justify-center">
          <span className="text-white font-black text-sm">A</span>
        </div>
        <span className="font-extrabold text-destructive text-base">Admin</span>
        <span className="text-text-muted text-xs font-medium">Console</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto hide-scrollbar">
        {adminNavSections.map((section, sIdx) => (
          <div key={section.title}>
            {sIdx > 0 && <div className="h-px bg-border mx-2 my-2" />}
            <div className="mb-1">
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[1.5px] text-text-muted">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                        active
                          ? "bg-destructive/[0.08] text-destructive"
                          : "text-text-muted hover:bg-background-tertiary hover:text-text-secondary"
                      }`}
                    >
                      {active && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-destructive rounded-sm" />
                      )}
                      <span className="material-symbols-outlined text-lg">
                        {item.icon}
                      </span>
                      {item.label}
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="ml-auto bg-destructive text-white text-[10px] font-bold px-1.5 py-px rounded-full min-w-[16px] text-center">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-border">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-background-tertiary transition-colors text-text-muted hover:text-text-secondary"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          <span className="text-[13px] font-medium">Back to App</span>
        </Link>
        <div className="flex items-center gap-2.5 px-2 py-2 mt-1">
          <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
            <span className="text-destructive text-xs font-bold">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">{adminName}</p>
            <p className="text-[10px] text-text-muted">Super Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
