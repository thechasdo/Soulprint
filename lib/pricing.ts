export type BillingInterval = "monthly" | "yearly";
export type CheckoutMode = "subscription" | "payment";

export type PlanId = "free" | "family_legacy" | "forever_archive";

export type Plan = {
  id: PlanId;
  internalTier: PlanId;
  name: string;
  badge?: string;
  bestFor: string;
  monthly: number;
  yearly: number;
  storageGb: number;
  profileLimit: number;
  uploadLimit: number | null;
  contributorLimit?: number;
  profiles: string;
  highlighted?: boolean;
  stripeMonthlyEnv?: string;
  stripeYearlyEnv?: string;
  features: string[];
};

export type AddOnEntitlement = {
  extraStorageGb?: number;
  aiStoryBuilder?: boolean;
  estateVault?: boolean;
  fulfillmentRequired?: boolean;
};

export type RecurringAddOn = {
  id: "extra_25gb_storage" | "extra_100gb_storage" | "ai_story_builder";
  name: string;
  price: string;
  billingType: "recurring";
  monthly: number;
  yearly: number;
  stripeMonthlyEnv: string;
  stripeYearlyEnv: string;
  notes: string;
  entitlement: AddOnEntitlement;
};

export type OneTimeAddOnOption = {
  id: string;
  label: string;
  price: number;
  priceLabel: string;
  stripeEnv: string;
};

export type OneTimeAddOn = {
  id: "soulprint_qr_code_kit" | "printed_memory_book" | "white_glove_setup" | "family_archive_migration";
  name: string;
  price: string;
  billingType: "one_time";
  notes: string;
  options: OneTimeAddOnOption[];
  entitlement: AddOnEntitlement;
};

export type FutureAddOn = {
  id: "estate_vault";
  name: string;
  price: string;
  billingType: "future";
  notes: string;
  entitlement: AddOnEntitlement;
};

export type AddOn = RecurringAddOn | OneTimeAddOn | FutureAddOn;

export const PRICING_REVISION = {
  version: "v1.0",
  revisionDate: "June 4, 2026",
  annualSavingsClaim: "20% savings compared with monthly billing"
} as const;

export const plans: Plan[] = [
  {
    id: "free",
    internalTier: "free",
    name: "Memory Seed",
    badge: "Free Starter Plan",
    bestFor: "trying Soulprint",
    monthly: 0,
    yearly: 0,
    storageGb: 1,
    profileLimit: 1,
    uploadLimit: 50,
    contributorLimit: 3,
    profiles: "1 Soulprint",
    features: [
      "1 Soulprint",
      "1 GB secure storage",
      "50 memory uploads",
      "Basic Soulprint",
      "Photos, written stories, and documents",
      "Basic timeline and search",
      "3 invited contributors"
    ]
  },
  {
    id: "family_legacy",
    internalTier: "family_legacy",
    name: "Family Legacy",
    badge: "Recommended",
    bestFor: "most families",
    monthly: 8.99,
    yearly: 86.30,
    storageGb: 25,
    profileLimit: 5,
    uploadLimit: null,
    profiles: "Up to 5 Soulprints",
    highlighted: true,
    stripeMonthlyEnv: "STRIPE_PRICE_FAMILY_LEGACY_MONTHLY",
    stripeYearlyEnv: "STRIPE_PRICE_FAMILY_LEGACY_YEARLY",
    features: [
      "Up to 5 Soulprints",
      "25 GB secure storage",
      "Photos, videos, audio, and documents",
      "Timeline builder and prompts",
      "Private family permissions",
      "Indexed uploads for search",
      "QR code sharing",
      "Annual export tools"
    ]
  },
  {
    id: "forever_archive",
    internalTier: "forever_archive",
    name: "Forever Archive",
    badge: "Premium Archive",
    bestFor: "serious preservation",
    monthly: 19.99,
    yearly: 191.90,
    storageGb: 100,
    profileLimit: 25,
    uploadLimit: null,
    profiles: "Up to 25 Soulprints",
    stripeMonthlyEnv: "STRIPE_PRICE_FOREVER_ARCHIVE_MONTHLY",
    stripeYearlyEnv: "STRIPE_PRICE_FOREVER_ARCHIVE_YEARLY",
    features: [
      "Up to 25 Soulprints",
      "100 GB secure storage",
      "Advanced upload indexing",
      "OCR/transcription-ready architecture",
      "Legacy contact access controls",
      "Family tree and Ancestry link fields",
      "Premium Soulprint themes",
      "Estate Vault access when released"
    ]
  }
];

export const addOns: AddOn[] = [
  {
    id: "extra_25gb_storage",
    name: "Extra 25 GB Storage",
    price: "$3/mo or $28.80/yr",
    billingType: "recurring",
    monthly: 3,
    yearly: 28.80,
    stripeMonthlyEnv: "STRIPE_PRICE_EXTRA_25GB_STORAGE_MONTHLY",
    stripeYearlyEnv: "STRIPE_PRICE_EXTRA_25GB_STORAGE_YEARLY",
    notes: "Additional storage block for accounts that need more space.",
    entitlement: { extraStorageGb: 25 }
  },
  {
    id: "extra_100gb_storage",
    name: "Extra 100 GB Storage",
    price: "$8/mo or $76.80/yr",
    billingType: "recurring",
    monthly: 8,
    yearly: 76.80,
    stripeMonthlyEnv: "STRIPE_PRICE_EXTRA_100GB_STORAGE_MONTHLY",
    stripeYearlyEnv: "STRIPE_PRICE_EXTRA_100GB_STORAGE_YEARLY",
    notes: "Larger storage block for heavier photo, video, audio, and document archives.",
    entitlement: { extraStorageGb: 100 }
  },
  {
    id: "ai_story_builder",
    name: "AI Story Builder",
    price: "$5/mo or $48/yr",
    billingType: "recurring",
    monthly: 5,
    yearly: 48,
    stripeMonthlyEnv: "STRIPE_PRICE_AI_STORY_BUILDER_MONTHLY",
    stripeYearlyEnv: "STRIPE_PRICE_AI_STORY_BUILDER_YEARLY",
    notes: "Premium storytelling assistant for turning memories into written stories.",
    entitlement: { aiStoryBuilder: true }
  },
  {
    id: "soulprint_qr_code_kit",
    name: "Soulprint QR Code Kit",
    price: "$19 digital / $49 printed",
    billingType: "one_time",
    notes: "Digital QR kit or printed QR keepsake option for Soulprint sharing.",
    options: [
      {
        id: "digital",
        label: "Digital QR Kit",
        price: 19,
        priceLabel: "$19 digital",
        stripeEnv: "STRIPE_PRICE_SOULPRINT_QR_KIT_DIGITAL"
      },
      {
        id: "printed",
        label: "Printed QR Kit",
        price: 49,
        priceLabel: "$49 printed",
        stripeEnv: "STRIPE_PRICE_SOULPRINT_QR_KIT_PRINTED"
      }
    ],
    entitlement: { fulfillmentRequired: true }
  },
  {
    id: "printed_memory_book",
    name: "Printed Memory Book",
    price: "Starting at $79",
    billingType: "one_time",
    notes: "Printed keepsake book. Final cost may vary by print specifications.",
    options: [
      {
        id: "starting",
        label: "Printed Memory Book - Starting Price",
        price: 79,
        priceLabel: "Starting at $79",
        stripeEnv: "STRIPE_PRICE_PRINTED_MEMORY_BOOK_STARTING"
      }
    ],
    entitlement: { fulfillmentRequired: true }
  },
  {
    id: "white_glove_setup",
    name: "White-glove Setup",
    price: "$99 one-time",
    billingType: "one_time",
    notes: "Assisted onboarding and setup support.",
    options: [
      {
        id: "standard",
        label: "White-glove Setup",
        price: 99,
        priceLabel: "$99 one-time",
        stripeEnv: "STRIPE_PRICE_WHITE_GLOVE_SETUP"
      }
    ],
    entitlement: { fulfillmentRequired: true }
  },
  {
    id: "family_archive_migration",
    name: "Family Archive Migration",
    price: "$149–$299 one-time",
    billingType: "one_time",
    notes: "Migration support priced by archive size and complexity.",
    options: [
      {
        id: "standard",
        label: "Family Archive Migration - Standard",
        price: 149,
        priceLabel: "$149 standard migration",
        stripeEnv: "STRIPE_PRICE_FAMILY_ARCHIVE_MIGRATION_STANDARD"
      },
      {
        id: "plus",
        label: "Family Archive Migration - Plus",
        price: 199,
        priceLabel: "$199 plus migration",
        stripeEnv: "STRIPE_PRICE_FAMILY_ARCHIVE_MIGRATION_PLUS"
      },
      {
        id: "large",
        label: "Family Archive Migration - Large Archive",
        price: 299,
        priceLabel: "$299 large migration",
        stripeEnv: "STRIPE_PRICE_FAMILY_ARCHIVE_MIGRATION_LARGE"
      }
    ],
    entitlement: { fulfillmentRequired: true }
  },
  {
    id: "estate_vault",
    name: "Estate Vault",
    price: "Built now; disabled until launch",
    billingType: "future",
    notes: "Future add-on for lower tiers. Included with Forever Archive when released.",
    entitlement: { estateVault: true }
  }
];

export function getPlanById(id: string | null | undefined) {
  return plans.find((plan) => plan.id === id);
}

export function getAddOnById(id: string | null | undefined) {
  return addOns.find((addOn) => addOn.id === id);
}

export function isRecurringAddOn(addOn: AddOn): addOn is RecurringAddOn {
  return addOn.billingType === "recurring";
}

export function isOneTimeAddOn(addOn: AddOn): addOn is OneTimeAddOn {
  return addOn.billingType === "one_time";
}

export function isFutureAddOn(addOn: AddOn): addOn is FutureAddOn {
  return addOn.billingType === "future";
}

export function getPlanStripeEnv(plan: Plan, billing: BillingInterval) {
  return billing === "yearly" ? plan.stripeYearlyEnv : plan.stripeMonthlyEnv;
}

export function getRecurringAddOnStripeEnv(addOn: RecurringAddOn, billing: BillingInterval) {
  return billing === "yearly" ? addOn.stripeYearlyEnv : addOn.stripeMonthlyEnv;
}

export function getOneTimeAddOnOption(addOn: OneTimeAddOn, optionId?: string | null) {
  return addOn.options.find((option) => option.id === optionId) ?? addOn.options[0];
}
