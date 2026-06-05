import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        seed: {
          50: "#eef8ef",
          100: "#d8efdc",
          500: "#278342",
          600: "#1f6d36",
          700: "#19572d",
          800: "#124423",
          900: "#0f341d",
          950: "#092314"
        },
        harvest: {
          50: "#fff8e1",
          200: "#f4d06f",
          300: "#e9bd43",
          600: "#a36d00"
        }
      }
    }
  },
  plugins: []
};

export default config;
