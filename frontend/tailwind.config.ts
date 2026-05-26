import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#050505",
        surface: "#0A0A0F",
        elevated: "#12121A",
        cyan: "#00F5FF",
        magenta: "#FF0055",
        green: "#CCFF00",
        slateGlow: "rgba(255,255,255,0.08)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Clash Display", "sans-serif"],
      },
      boxShadow: {
        card: "0 18px 60px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)",
        cyan: "0 0 30px rgba(0, 245, 255, 0.18)",
        magenta: "0 0 24px rgba(255, 0, 85, 0.18)",
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
        haze: "radial-gradient(circle at top left, rgba(0,245,255,0.12), transparent 30%), radial-gradient(circle at top right, rgba(255,0,85,0.12), transparent 28%), radial-gradient(circle at bottom center, rgba(204,255,0,0.06), transparent 35%)",
      },
      animation: {
        float: "float 10s ease-in-out infinite",
        pulseGlow: "pulseGlow 2.4s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 rgba(0,245,255,0.12)" },
          "50%": { boxShadow: "0 0 24px rgba(0,245,255,0.28)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
