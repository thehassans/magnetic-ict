import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
    "./messages/**/*.json"
  ],
  theme: {
    extend: {
      colors: {
        background: "#f7f5ff",
        foreground: "#0f172a",
        accent: {
          DEFAULT: "#7c3aed",
          secondary: "#06b6d4"
        },
        surface: "rgba(255, 255, 255, 0.9)"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,0.7), 0 24px 80px rgba(124,58,237,0.12)"
      },
      backdropBlur: {
        xs: "2px"
      },
      backgroundImage: {
        "hero-radial": "radial-gradient(circle at top, rgba(124,58,237,0.12), transparent 34%), radial-gradient(circle at 80% 20%, rgba(6,182,212,0.12), transparent 24%)"
      }
    }
  },
  plugins: []
};

export default config;
