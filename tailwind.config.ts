import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core surface palette — dark with a faint teal-green undertone
        ink: {
          950: "#050c0b",
          900: "#0a1211",
          800: "#111b19",
          700: "#1a2723",
          600: "#22332f",
        },
        // Brand accents — teal → spring green
        zine: {
          teal: "#2dd4bf",
          green: "#22c07a",
          mint: "#4ade80",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
      },
      backgroundImage: {
        "zine-gradient":
          "linear-gradient(120deg, #2dd4bf 0%, #22c07a 55%, #34c759 100%)",
        "zine-radial":
          "radial-gradient(60% 60% at 50% 0%, rgba(45,212,191,0.18) 0%, rgba(34,192,122,0.08) 45%, rgba(5,12,11,0) 80%)",
      },
      boxShadow: {
        glow: "0 0 40px -8px rgba(45,212,191,0.5)",
        "glow-teal": "0 0 44px -8px rgba(34,211,238,0.45)",
        "glow-mint": "0 0 44px -8px rgba(74,222,128,0.45)",
        glass: "0 8px 40px -12px rgba(0,0,0,0.6)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 1.6s infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
