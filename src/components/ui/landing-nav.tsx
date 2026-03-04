"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ThemeToggle } from "./theme-toggle";

const NAV_LINKS = [
  { href: "#features", label: "Platform" },
  { href: "#assets", label: "Assets" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#security", label: "Security" },
];

export function LandingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-background/95 backdrop-blur-xl border-b border-border py-3"
          : "py-4"
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-extrabold text-xl tracking-tight">
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-purple rounded-[10px] flex items-center justify-center text-white text-lg font-black">
            &infin;
          </div>
          <span className="text-text-primary">
            INFINIT<span className="text-primary-light">V8</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden lg:flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/auth/signin"
            className="px-4 py-2 text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-white rounded-sm hover:bg-primary-dark transition-colors shadow-glow"
          >
            Get Started
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </Link>
        </div>

        {/* Mobile: theme toggle + hamburger */}
        <div className="flex lg:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg hover:bg-background-secondary transition-colors"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-xl text-text-secondary">
              {mobileOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-background/98 backdrop-blur-xl border-b border-border">
          <div className="max-w-[1280px] mx-auto px-6 py-4 flex flex-col gap-2">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="h-px bg-border my-2" />
            <Link
              href="/auth/signin"
              className="py-2 text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold bg-primary text-white rounded-sm shadow-glow"
            >
              Get Started
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
