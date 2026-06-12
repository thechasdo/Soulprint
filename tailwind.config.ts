import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "var(--sp-color-navy)",
        seafoam: "var(--sp-color-teal)",
        sunset: "var(--sp-color-pink)",
        orange: "var(--sp-color-coral)",
        cream: "var(--sp-color-ivory)",
        ink: "var(--sp-color-ink)",
        soulprint: {
          navy: "var(--sp-color-navy)",
          cobalt: "var(--sp-color-cobalt)",
          teal: "var(--sp-color-teal)",
          pink: "var(--sp-color-pink)",
          coral: "var(--sp-color-coral)",
          gold: "var(--sp-color-gold)",
          ivory: "var(--sp-color-ivory)",
          ink: "var(--sp-color-ink)",
          muted: "var(--sp-color-muted)",
          line: "var(--sp-color-line)",
        },
      },
      fontFamily: {
        "soul-display": ["var(--sp-font-display)"],
        "soul-story": ["var(--sp-font-story)"],
        "soul-sans": ["var(--sp-font-sans)"],
        "soul-script": ["var(--sp-font-script)"],
      },
      borderRadius: {
        brand: "var(--sp-radius-2xl)",
        "soul-sm": "var(--sp-radius-sm)",
        "soul-md": "var(--sp-radius-md)",
        "soul-lg": "var(--sp-radius-lg)",
        "soul-xl": "var(--sp-radius-xl)",
        "soul-2xl": "var(--sp-radius-2xl)",
        "soul-pill": "var(--sp-radius-pill)",
      },
      boxShadow: {
        glow: "var(--sp-shadow-soft)",
        "soul-soft": "var(--sp-shadow-soft)",
        "soul-card": "var(--sp-shadow-card)",
        "soul-glow-pink": "var(--sp-shadow-glow-pink)",
        "soul-glow-teal": "var(--sp-shadow-glow-teal)",
        "soul-focus": "var(--sp-shadow-focus)",
      },
      backgroundImage: {
        "soul-memory-ribbon": "var(--sp-gradient-memory-ribbon)",
        "soul-sunrise-memory": "var(--sp-gradient-sunrise-memory)",
        "soul-teal-blue-glow": "var(--sp-gradient-teal-blue-glow)",
        "soul-ivory-aurora": "var(--sp-gradient-ivory-aurora)",
        "soul-night-memory": "var(--sp-gradient-night-memory)",
      },
    },
  },
  plugins: [],
};

export default config;
