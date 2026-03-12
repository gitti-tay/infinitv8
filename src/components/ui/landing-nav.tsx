"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { ThemeToggle } from "./theme-toggle";
import { ArrowRight, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "#features", label: "Platform" },
  { href: "#assets", label: "Assets" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#security", label: "Security" },
];

export function LandingNav() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass border-b border-border shadow-soft py-2.5"
          : "py-4"
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-extrabold text-xl tracking-tight">
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-purple rounded-xl flex items-center justify-center text-white text-lg font-black shadow-glow">
            &infin;
          </div>
          <span className="text-text-primary">
            INFINIT<span className="gradient-text">V8</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-4 py-2 text-sm font-medium text-text-tertiary hover:text-text-primary rounded-lg hover:bg-background-secondary/60 transition-all duration-200"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden lg:flex items-center gap-3">
          <ThemeToggle />
          {isLoggedIn ? (
            <>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-4 py-2 text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors"
              >
                Sign Out
              </button>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-primary to-purple text-white rounded-xl hover:shadow-glow transition-all duration-300"
              >
                Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="px-4 py-2 text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-primary to-purple text-white rounded-xl hover:shadow-glow transition-all duration-300"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile: theme toggle + hamburger */}
        <div className="flex lg:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl hover:bg-background-secondary transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="w-5 h-5 text-text-secondary" />
            ) : (
              <Menu className="w-5 h-5 text-text-secondary" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden glass border-b border-border animate-slideUp">
          <div className="max-w-[1280px] mx-auto px-6 py-4 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="py-2.5 px-3 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-background-secondary/60 rounded-lg transition-all"
              >
                {link.label}
              </a>
            ))}
            <div className="h-px bg-border my-2" />
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold bg-gradient-to-r from-primary to-purple text-white rounded-xl shadow-glow"
                >
                  Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="py-2.5 text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  onClick={() => setMobileOpen(false)}
                  className="py-2.5 px-3 text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold bg-gradient-to-r from-primary to-purple text-white rounded-xl shadow-glow"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
