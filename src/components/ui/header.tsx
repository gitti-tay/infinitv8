"use client";

import { useRouter } from "next/navigation";

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export function Header({ title, showBack = true, rightAction }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="fixed top-0 w-full z-50 bg-bg-light/95 dark:bg-bg-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="px-5 py-4 flex justify-between items-center max-w-md mx-auto">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => router.back()}
              className="text-text-muted dark:text-gray-400 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
          )}
          <h1 className="font-bold text-lg tracking-tight">{title}</h1>
        </div>
        {rightAction && (
          <div className="flex items-center gap-4">{rightAction}</div>
        )}
      </div>
    </header>
  );
}
