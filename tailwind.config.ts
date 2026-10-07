import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Montserrat", "sans-serif"],
        montserrat: ["Montserrat", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#f6f3ff",
          100: "#ede7fe",
          200: "#ddd1fd",
          300: "#c2adfc",
          400: "#9973f7",
          500: "#6d3af0",
          600: "#4617a8", // Primary brand color
          700: "#381289",
          800: "#2d0e6c",
          900: "#220a50",
          950: "#140533",
        },
        genesis: {
          dark: "#1a1a1a",
          purple: "#4617a8",
          orange: "#ff6600",
          magenta: "#8b1fa3",
          offwhite: "#f8f9fb",
          surface: "#ffffff",
          muted: "#666d7d",
          border: "#e7e9ed",
        },
        clickup: {
          bg: "#f8f9fb",
          card: "#ffffff",
          sidebar: "#ffffff",
          border: "#e7e9ed",
          hover: "#f3f4f8",
          text: "#1a1a1a",
          subtext: "#6b7280",
          purple: "#4617a8",
          orange: "#ff6600",
          blue: "#2b6cb0",
          green: "#10b981",
        },
      },
      backgroundImage: {
        "genesis-gradient": "linear-gradient(135deg, #4617a8 0%, #8b1fa3 50%, #ff6600 100%)",
        "genesis-gradient-hover": "linear-gradient(135deg, #531cc7 0%, #9e24b9 50%, #ff771a 100%)",
        "genesis-card": "linear-gradient(180deg, #ffffff 0%, #fafafc 100%)",
      },
      boxShadow: {
        "clickup-sm": "0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)",
        "clickup-md": "0 4px 12px rgba(26, 26, 26, 0.06), 0 1px 3px rgba(26, 26, 26, 0.04)",
        "clickup-lg": "0 10px 25px -3px rgba(70, 23, 168, 0.08), 0 4px 6px -2px rgba(26, 26, 26, 0.03)",
        "genesis-glow": "0 4px 20px rgba(70, 23, 168, 0.25)",
      },
    },
  },
  plugins: [],
};
export default config;
