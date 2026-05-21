import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        carbon: {
          DEFAULT: "#0a0a0b",
          deep: "#050506",
          elevated: "#0f0f11",
        },
        graphite: {
          DEFAULT: "#161618",
          matte: "#1c1c1f",
          border: "#2a2a2e",
          muted: "#3f3f46",
        },
        cyber: {
          yellow: "#f5e642",
          "yellow-dim": "#c4b835",
        },
        neon: {
          cyan: "#00e5ff",
          "cyan-dim": "#00b8cc",
        },
        onyx: {
          fg: "#e4e4e7",
          muted: "#71717a",
          subtle: "#52525b",
          danger: "#ef4444",
          success: "#22c55e",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },
      borderRadius: {
        none: "0",
        sm: "2px",
      },
      boxShadow: {
        onyx: "0 1px 0 0 rgba(255,255,255,0.04)",
        "onyx-inset": "inset 0 1px 0 0 rgba(255,255,255,0.02)",
      },
      spacing: {
        sidebar: "52px",
        topbar: "40px",
      },
      animation: {
        "pulse-neon": "pulse-neon 2s ease-in-out infinite",
        "shimmer": "shimmer 2s infinite linear",
        "fade-in": "fade-in 0.3s ease-out forwards",
        "slide-in-up": "slide-in-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "glow-pulse": "glow-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        "pulse-neon": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-in-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 5px rgba(0, 240, 255, 0.1), inset 0 0 5px rgba(0, 240, 255, 0.05)" },
          "50%": { boxShadow: "0 0 15px rgba(0, 240, 255, 0.3), inset 0 0 10px rgba(0, 240, 255, 0.1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
