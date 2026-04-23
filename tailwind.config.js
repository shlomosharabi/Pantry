/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', "sans-serif"],
        mono: ['"DM Mono"', "monospace"],
      },
      colors: {
        ink: {
          950: "#0d0d1a",
          900: "#1a1a2e",
          800: "#16213e",
          700: "#0f3460",
        },
        jade: {
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
        },
        amber: {
          400: "#fbbf24",
          500: "#f59e0b",
        },
        rose: {
          400: "#fb7185",
          500: "#f43f5e",
        },
        mist: {
          100: "#f0f4ff",
          200: "#e0e7ff",
          300: "#c7d2fe",
          400: "#a5b4fc",
          500: "#818cf8",
        },
      },
    },
  },
  plugins: [require("tailwindcss-rtl")],
};
