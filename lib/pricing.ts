export type Plan = {
  id: "free" | "family_legacy" | "forever_archive";
  name: string;
  monthly: number;
  yearly: number;
  storageGb: number;
  profiles: string;
  highlighted?: boolean;
  stripeMonthlyEnv?: string;
  stripeYearlyEnv?: string;
  features: string[];
};

export const plans: Plan[] = [
  {
    id: "free",
    name: "Memory Seed",
    monthly: 0,
    yearly: 0,
    storageGb: 1,
    profiles: "1 Soulprint",
    features: [
      "1 private or public Soulprint profile",
      "Basic memorial page with logo-branded sharing",
      "50 memory uploads",
      "Basic photo, story, and document storage",
      "3 invited family contributors",
      "Simple keyword search"
    ]
  },
  {
    id: "family_legacy",
    name: "Family Legacy",
    monthly: 8.99,
    yearly: 86.30,
    storageGb: 25,
    profiles: "5 Soulprints",
    highlighted: true,
    stripeMonthlyEnv: "STRIPE_PRICE_FAMILY_LEGACY_MONTHLY",
    stripeYearlyEnv: "STRIPE_PRICE_FAMILY_LEGACY_YEARLY",
    features: [
      "Up to 5 Soulprint profiles",
      "25 GB secure family storage",
      "Photos, videos, audio, letters, and documents",
      "Timeline builder and memory prompts",
      "Private family permissions",
      "Indexed uploads for easy searching",
      "QR code sharing for memorial pages",
      "Annual export tools"
    ]
  },
  {
    id: "forever_archive",
    name: "Forever Archive",
    monthly: 19.99,
    yearly: 191.90,
    storageGb: 100,
    profiles: "25 Soulprints",
    stripeMonthlyEnv: "STRIPE_PRICE_FOREVER_ARCHIVE_MONTHLY",
    stripeYearlyEnv: "STRIPE_PRICE_FOREVER_ARCHIVE_YEARLY",
    features: [
      "Up to 25 Soulprint profiles",
      "100 GB secure archive storage",
      "Advanced upload indexing pipeline",
      "OCR-ready document search",
      "Audio/video transcription-ready architecture",
      "Legacy contact access controls",
      "Family tree and Ancestry link fields",
      "Premium memorial themes",
      "Estate Vault access when released"
    ]
  }
];

export const addOns = [
  { name: "Extra 25 GB Storage", price: "$3/mo or $28.80/yr" },
  { name: "Extra 100 GB Storage", price: "$8/mo or $76.80/yr" },
  { name: "AI Story Builder", price: "$5/mo or $48/yr" },
  { name: "Memorial QR Code Kit", price: "$19 digital / $49 printed" },
  { name: "Printed Memory Book", price: "Starting at $79" },
  { name: "White-glove Setup", price: "$99 one-time" },
  { name: "Family Archive Migration", price: "$149–$299 one-time" },
  { name: "Estate Vault", price: "Built now, disabled until launch" }
];
