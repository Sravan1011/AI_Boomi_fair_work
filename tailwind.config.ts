import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cosmos-grade dark foundation
        backdrop: "#050505",
        surface: {
          DEFAULT: "#0a0a0f",
          elevated: "#111118",
          border: "#1a1a24",
        },
        // Accent palette — indigo / violet only
        accent: {
          indigo: "#6366f1",
          violet: "#7c3aed",
          blue: "#3b82f6",
          "indigo-muted": "rgba(99, 102, 241, 0.15)",
          "violet-muted": "rgba(124, 58, 237, 0.12)",
        },
        // Text hierarchy
        "text-primary": "#f0f0f5",
        "text-muted": "#8888a0",
        "text-subtle": "#55556a",
        // Glow
        glow: {
          indigo: "rgba(99, 102, 241, 0.25)",
          violet: "rgba(124, 58, 237, 0.20)",
        },
        // Legacy system — keep for existing pages
        primary: {
          900: "#1e1b4b",
          700: "#4338ca",
          500: "#6366f1",
          300: "#a5b4fc",
        },
        secondary: {
          700: "#6d28d9",
          500: "#8b5cf6",
        },
        neutral: {
          950: "#0f172a",
          900: "#1e293b",
          800: "#334155",
          100: "#f1f5f9",
          50: "#f8fafc",
        },
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
      fontFamily: {
        sans: ["Inter", "SF Pro Display", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      fontSize: {
        "hero": ["clamp(3rem, 6vw, 5rem)", { lineHeight: "1.05", letterSpacing: "-0.02em", fontWeight: "300" }],
        "hero-sub": ["clamp(1.125rem, 1.5vw, 1.375rem)", { lineHeight: "1.6", fontWeight: "400" }],
        "section-title": ["clamp(2rem, 3.5vw, 3rem)", { lineHeight: "1.08", letterSpacing: "-0.02em", fontWeight: "300" }],
        "section-sub": ["clamp(1rem, 1.2vw, 1.125rem)", { lineHeight: "1.7", fontWeight: "400" }],
        "metric": ["clamp(2.5rem, 4vw, 3.5rem)", { lineHeight: "1", letterSpacing: "-0.02em", fontWeight: "300" }],
      },
      spacing: {
        section: "120px",
        "section-lg": "160px",
        "hero-top": "160px",
        xs: "0.5rem",
        sm: "0.75rem",
        md: "1rem",
        lg: "1.5rem",
        xl: "2rem",
        "2xl": "3rem",
        "3xl": "4rem",
      },
      maxWidth: {
        container: "1280px",
      },
      borderRadius: {
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        pill: "9999px",
      },
      boxShadow: {
        "glow-sm": "0 0 20px rgba(99, 102, 241, 0.15)",
        "glow-md": "0 0 40px rgba(99, 102, 241, 0.2)",
        "glow-lg": "0 0 80px rgba(99, 102, 241, 0.25)",
        "glow-violet": "0 0 60px rgba(124, 58, 237, 0.2)",
        "card-hover": "0 0 40px rgba(99, 102, 241, 0.12), 0 8px 32px rgba(0, 0, 0, 0.4)",
        "indigo-sm": "0 1px 2px 0 rgba(99, 102, 241, 0.05)",
        "indigo-md": "0 4px 6px -1px rgba(99, 102, 241, 0.1)",
        "indigo-lg": "0 10px 15px -3px rgba(99, 102, 241, 0.1)",
        "indigo-xl": "0 20px 25px -5px rgba(99, 102, 241, 0.1)",
      },
      backgroundImage: {
        "grid-pattern": "linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)",
        "vignette": "radial-gradient(ellipse at center, transparent 50%, #050505 100%)",
      },
      backgroundSize: {
        grid: "40px 40px",
      },
      transitionDuration: {
        "400": "400ms",
      },
      animation: {
        "glow-pulse": "glow-pulse 4s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        "glow-pulse": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.7" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
