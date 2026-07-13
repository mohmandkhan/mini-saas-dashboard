import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#d9e6ff",
          200: "#bcd3ff",
          300: "#8fb6ff",
          400: "#5b8dff",
          500: "#3563ff",
          600: "#1f43f5",
          700: "#1832e1",
          800: "#1a2bb6",
          900: "#1c2b8f",
        },
      },
    },
  },
  plugins: [],
};

export default config;
