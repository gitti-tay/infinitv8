import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        "background-secondary": "var(--background-secondary)",
        "background-tertiary": "var(--background-tertiary)",
        card: "var(--card)",
        "card-hover": "var(--card-hover)",
        border: "var(--border)",
        "border-light": "var(--border-light)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-tertiary": "var(--text-tertiary)",
        "text-muted": "var(--text-muted)",
        primary: "#3b82f6",
        "primary-dark": "#2563eb",
        "primary-darker": "#1d4ed8",
        "primary-light": "#60a5fa",
        "primary-lighter": "#93c5fd",
        accent: "#10b981",
        "accent-dark": "#059669",
        "accent-light": "#34d399",
        destructive: "#ef4444",
        "destructive-dark": "#dc2626",
        amber: "#f59e0b",
        "amber-dark": "#d97706",
        purple: "#8b5cf6",
        "purple-dark": "#7c3aed",
        cyan: "#06b6d4",
      },
      fontFamily: {
        display: ["var(--font-manrope)", "sans-serif"],
        body: ["var(--font-manrope)", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        DEFAULT: "0.75rem",
        sm: "0.5rem",
        lg: "1rem",
        xl: "1.5rem",
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        medium: "var(--shadow-medium)",
        heavy: "var(--shadow-heavy)",
        glow: "0 0 20px rgba(59,130,246,.15)",
        "glow-green": "0 0 20px rgba(16,185,129,.15)",
      },
      animation: {
        fadeIn: "fadeIn 0.3s ease-out",
        fadeUp: "fadeUp 0.6s ease",
        slideRight: "slideRight 0.5s ease",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideRight: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
