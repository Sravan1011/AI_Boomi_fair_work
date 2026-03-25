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
        // ── Light foundation (Fiverr-inspired) ───────────────────────
        backdrop: "#FFFFFF",
        surface: {
          DEFAULT: "#F7F7F7",
          elevated: "#FFFFFF",
          border: "#E4E5E7",
          glass: "rgba(255,255,255,0.92)",
        },
        // ── Accent palette (Fiverr green as primary) ─────────────────
        accent: {
          DEFAULT:         "hsl(var(--accent))",
          foreground:      "hsl(var(--accent-foreground))",
          indigo:          "#1DBF73",   // Fiverr green (replaces indigo)
          violet:          "#19A463",   // Darker green (replaces violet)
          blue:            "#1DBF73",
          emerald:         "#1DBF73",
          amber:           "#f59e0b",
          "indigo-muted":  "rgba(29,191,115,0.12)",
          "violet-muted":  "rgba(25,164,99,0.08)",
          "emerald-muted": "rgba(29,191,115,0.12)",
          "amber-muted":   "rgba(245,158,11,0.10)",
        },
        // ── Text hierarchy ────────────────────────────────────────────
        "text-primary": "#404145",
        "text-muted":   "#74767E",
        "text-subtle":  "#95979D",
        // ── Glow (subtle green tints) ─────────────────────────────────
        glow: {
          indigo:  "rgba(29,191,115,0.20)",
          violet:  "rgba(25,164,99,0.15)",
          emerald: "rgba(29,191,115,0.20)",
        },
        // ── Fiverr brand tokens ───────────────────────────────────────
        "fw-green":       "#1DBF73",
        "fw-green-dark":  "#19A463",
        "fw-green-light": "#E9F9F0",
        "fw-dark":        "#1E1E1E",
        "fw-dark-mid":    "#2A2A2A",
        "fw-gray":        "#F5F5F5",
        "fw-star":        "#FFBE00",
        // ── shadcn/ui HSL tokens ──────────────────────────────────────
        border:      "hsl(var(--border))",
        input:       "hsl(var(--input))",
        ring:        "hsl(var(--ring))",
        background:  "hsl(var(--background))",
        foreground:  "hsl(var(--foreground))",
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // ── Semantic ──────────────────────────────────────────────────
        success: "#1DBF73",
        warning: "#f59e0b",
        danger:  "#ef4444",
      },
      fontFamily: {
        sans:    ["var(--font-jakarta)", "Plus Jakarta Sans", "Inter", "-apple-system", "sans-serif"],
        heading: ["var(--font-jakarta)", "Plus Jakarta Sans", "sans-serif"],
        display: ["var(--font-jakarta)", "Plus Jakarta Sans", "sans-serif"],
        mono:    ["JetBrains Mono", "Fira Code", "monospace"],
      },
      fontSize: {
        hero:           ["clamp(2.25rem, 5vw, 4rem)",   { lineHeight: "1.1",  letterSpacing: "-0.02em", fontWeight: "800" }],
        "hero-sub":     ["clamp(1rem, 1.5vw, 1.2rem)",  { lineHeight: "1.7",  fontWeight: "400" }],
        "section-title":["clamp(1.6rem, 3vw, 2.5rem)",  { lineHeight: "1.15", letterSpacing: "-0.01em", fontWeight: "700" }],
        metric:         ["clamp(1.75rem, 3vw, 2.5rem)", { lineHeight: "1",    letterSpacing: "-0.02em", fontWeight: "700" }],
      },
      spacing: {
        section:     "96px",
        "section-lg":"128px",
        "hero-top":  "80px",
        xs:  "0.5rem",
        sm:  "0.75rem",
        md:  "1rem",
        lg:  "1.5rem",
        xl:  "2rem",
        "2xl":"3rem",
        "3xl":"4rem",
      },
      maxWidth: {
        container: "1280px",
      },
      borderRadius: {
        lg:   "0.5rem",
        xl:   "0.75rem",
        "2xl":"1rem",
        "3xl":"1.5rem",
        pill: "9999px",
      },
      boxShadow: {
        // Clean elevation shadows (no glows)
        "glow-sm":     "0 2px 12px rgba(0,0,0,0.07)",
        "glow-md":     "0 4px 24px rgba(0,0,0,0.10)",
        "glow-lg":     "0 8px 40px rgba(0,0,0,0.13)",
        "glow-violet": "0 4px 16px rgba(29,191,115,0.18)",
        "glow-emerald":"0 4px 16px rgba(29,191,115,0.18)",
        // Cards
        "card":        "0 1px 3px rgba(0,0,0,0.08), 0 0 0 1px rgba(228,229,231,0.8)",
        "card-hover":  "0 8px 24px rgba(0,0,0,0.10), 0 0 0 1px rgba(29,191,115,0.25)",
        "card-md":     "0 2px 8px rgba(0,0,0,0.08)",
        // Glass (for dark hero sections)
        "glass":       "0 4px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08)",
        // Navigation
        "nav":         "0 1px 0 rgba(228,229,231,0.9)",
      },
      backgroundImage: {
        "grid-pattern":          "linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px)",
        "grid-dark":             "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
        "vignette":              "radial-gradient(ellipse at center, transparent 50%, #F7F7F7 100%)",
        "gradient-indigo-violet":"linear-gradient(135deg, #1DBF73 0%, #19A463 100%)",
        "gradient-radial-indigo":"radial-gradient(ellipse at top, rgba(29,191,115,0.08) 0%, transparent 60%)",
        "hero-dark":             "linear-gradient(160deg, #1a1a1a 0%, #222222 100%)",
      },
      backgroundSize: {
        grid: "40px 40px",
      },
      backdropBlur: {
        xs: "2px",
      },
      transitionDuration: {
        "400": "400ms",
      },
      animation: {
        "glow-pulse": "glow-pulse 4s ease-in-out infinite",
        "float":      "float 6s ease-in-out infinite",
        "blob":       "blob 8s ease-in-out infinite",
        "shimmer":    "shimmer 1.5s linear infinite",
        "fade-up":    "fadeInUp 0.5s ease-out",
      },
      keyframes: {
        "glow-pulse": {
          "0%, 100%": { opacity: "0.4" },
          "50%":      { opacity: "0.8" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-12px)" },
        },
        blob: {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "33%":      { transform: "translate(20px,-20px) scale(1.05)" },
          "66%":      { transform: "translate(-15px,10px) scale(0.95)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
