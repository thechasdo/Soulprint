export const soulprintTokens = {
  brand: {
    name: "Soulprint",
    tagline: "Memories Live On",
    parentEndorsement: "Created by Chasdo Creative Worldwide LLC",
    profilePrimaryName: "Soulprint Profile",
    profileAlternateName: "Soulprint",
  },
  colors: {
    navy: "#062A63",
    cobalt: "#0B63D1",
    teal: "#22D7E8",
    pink: "#FF4198",
    coral: "#FF7A73",
    gold: "#FFC93D",
    ivory: "#FFF8F1",
    ink: "#031A3F",
    muted: "#516179",
    line: "#D7EEF2",
  },
  gradients: {
    memoryRibbon: "linear-gradient(90deg, #FF4198 0%, #FF7A73 28%, #FFC93D 52%, #22D7E8 76%, #0B63D1 100%)",
    sunriseMemory: "linear-gradient(135deg, #FF4198 0%, #FF7A73 38%, #FFC93D 100%)",
    tealBlueGlow: "linear-gradient(135deg, #22D7E8 0%, #0B63D1 100%)",
    ivoryAurora: "radial-gradient(circle at top left, rgba(255,65,152,.18), transparent 30%), radial-gradient(circle at top right, rgba(34,215,232,.22), transparent 35%), #FFF8F1",
  },
  fonts: {
    display: "var(--sp-font-display)",
    story: "var(--sp-font-story)",
    sans: "var(--sp-font-sans)",
    script: "var(--sp-font-script)",
  },
  radius: {
    card: "var(--sp-radius-2xl)",
    pill: "var(--sp-radius-pill)",
  },
  shadows: {
    card: "var(--sp-shadow-card)",
    glowPink: "var(--sp-shadow-glow-pink)",
    glowTeal: "var(--sp-shadow-glow-teal)",
  },
} as const;

export type SoulprintTokens = typeof soulprintTokens;
