import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1132d4",
        "primary-dark": "#0d26a3",
        secondary: "#2563EB",
        accent: "#10B981",
        destructive: "#d4183d",
        muted: "#ececf0",
        "bg-light": "#f6f6f8",
        "bg-dark": "#101322",
        "card-light": "#FFFFFF",
        "card-dark": "#1a1d2d",
        "text-main": "#111827",
        "text-muted": "#717182",
      },
      fontFamily: {
        display: ["var(--font-manrope)", "sans-serif"],
        body: ["var(--font-manrope)", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.625rem",
        xl: "1rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(0, 0, 0, 0.05)",
        glow: "0 0 15px rgba(17, 50, 212, 0.3)",
      },
      animation: {
        fadeIn: "fadeIn 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
