import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1d4ed8",
          dark: "#1e3a8a",
        },
        result: {
          green: "#16a34a",
          yellow: "#eab308",
          red: "#dc2626",
        },
      },
    },
  },
  plugins: [],
};

export default config;
