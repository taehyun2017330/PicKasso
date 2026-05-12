import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./store/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      boxShadow: {
        trace: "0 1px 2px rgba(18, 18, 18, 0.05), 0 10px 28px rgba(18, 18, 18, 0.045)"
      }
    }
  },
  plugins: []
};

export default config;
