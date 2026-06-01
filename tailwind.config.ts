import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        navy: "#102A43",
        seafoam: "#58C7D9",
        sunset: "#FF6F91",
        orange: "#FF9A4D",
        cream: "#FFF9F0"
      },
      boxShadow: {
        glow: "0 24px 80px rgba(88, 199, 217, 0.28)",
        warm: "0 24px 80px rgba(255, 111, 145, 0.24)"
      },
      borderRadius: {
        brand: "2rem"
      }
    }
  },
  plugins: []
};

export default config;
