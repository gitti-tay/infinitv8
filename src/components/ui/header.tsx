"use client";

import { useRouter } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { ArrowLeft, Search, Bell } from "lucide-react";

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export function Header({ title, showBack = true, rightAction }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-20 glass border-b border-border">
      <div className="flex items-center justify-between px-4 md:px-6 h-14">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-xl hover:bg-background-tertiary transition-colors md:hidden"
            >
              <ArrowLeft className="w-5 h-5 text-text-secondary" />
            </button>
          )}
          <h3 className="text-text-primary font-semibold text-[15px]">{title}</h3>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Search (desktop only) */}
          <button className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-background-secondary/60 border border-border text-sm text-text-muted hover:bg-background-secondary transition-colors w-56">
            <Search className="w-4 h-4" />
            <span className="flex-1 text-left">Search...</span>
            <kbd className="text-[10px] bg-background-tertiary px-1.5 py-0.5 rounded font-mono">&#8984;K</kbd>
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-xl hover:bg-background-tertiary transition-colors">
            <Bell className="w-[18px] h-[18px] text-text-secondary" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full ring-2 ring-background" />
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
