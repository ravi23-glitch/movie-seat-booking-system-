import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff8eb",
          100: "#feedc7",
          200: "#fdd98a",
          300: "#fcbe4d",
          400: "#f99f1b",
          500: "#e6810a",
          600: "#c76106",
          700: "#9e4308",
          800: "#80350d",
          900: "#6a2d0f",
          950: "#3d1504",
        },
        cinema: {
          darker: "#07090e",
          dark: "#0d111a",
          card: "#131825",
          border: "#1f2639",
          hover: "#28314a",
          accent: "#f59e0b",
          neon: "#06b6d4",
          danger: "#ef4444",
          success: "#10b981",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Outfit", "Inter", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(245, 158, 11, 0.4)",
        "glow-cyan": "0 0 25px -5px rgba(6, 182, 212, 0.4)",
        screen: "0 15px 40px -10px rgba(6, 182, 212, 0.3)",
      },
    },
  },
  plugins: [],
};
export default config;
