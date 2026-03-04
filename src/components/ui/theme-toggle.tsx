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
