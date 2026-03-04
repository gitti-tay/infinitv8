"use client";

import { useRouter } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export function Header({ title, showBack = true, rightAction }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between px-4 md:px-6 h-16">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-lg hover:bg-background-tertiary transition-colors md:hidden"
            >
              <span className="material-symbols-outlined text-text-secondary">arrow_back</span>
            </button>
          )}
          <h3 className="text-text-primary font-semibold">{title}</h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Search (desktop only) */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg bg-background-secondary border border-border text-sm text-text-muted w-64">
            <span className="material-symbols-outlined text-lg">search</span>
            <span>Search...</span>
            <span className="ml-auto text-xs bg-background-tertiary px-1.5 py-0.5 rounded">&#8984;K</span>
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-background-tertiary transition-colors">
            <span className="material-symbols-outlined text-xl text-text-secondary">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full"></span>
          </button>

          {/* Theme toggle (visible on mobile in header, hidden on desktop where sidebar has it) */}
          <div className="md:hidden">
            <ThemeToggle />
          </div>

          {rightAction}
        </div>
      </div>
    </header>
  );
}
