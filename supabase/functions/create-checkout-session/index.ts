import Stripe from "https://esm.sh/stripe@14.25.0?target=deno";

type Billing = "monthly" | "yearly" | "one_time";
type CheckoutMode = "subscription" | "payment";

const PLAN_PRICE_ENVS: Record<string, string> = {
  "family_legacy:monthly": "STRIPE_PRICE_FAMILY_LEGACY_MONTHLY",
  "family_legacy:yearly": "STRIPE_PRICE_FAMILY_LEGACY_YEARLY",
  "forever_archive:monthly": "STRIPE_PRICE_FOREVER_ARCHIVE_MONTHLY",
  "forever_archive:yearly": "STRIPE_PRICE_FOREVER_ARCHIVE_YEARLY"
};

const ADDON_PRICE_ENVS: Record<string, { env: string; mode: CheckoutMode; billing: Billing }> = {
  "extra_25gb_storage:monthly": { env: "STRIPE_PRICE_EXTRA_25GB_STORAGE_MONTHLY", mode: "subscription", billing: "monthly" },
  "extra_25gb_storage:yearly": { env: "STRIPE_PRICE_EXTRA_25GB_STORAGE_YEARLY", mode: "subscription", billing: "yearly" },
  "extra_100gb_storage:monthly": { env: "STRIPE_PRICE_EXTRA_100GB_STORAGE_MONTHLY", mode: "subscription", billing: "monthly" },
  "extra_100gb_storage:yearly": { env: "STRIPE_PRICE_EXTRA_100GB_STORAGE_YEARLY", mode: "subscription", billing: "yearly" },
  "ai_story_builder:monthly": { env: "STRIPE_PRICE_AI_STORY_BUILDER_MONTHLY", mode: "subscription", billing: "monthly" },
  "ai_story_builder:yearly": { env: "STRIPE_PRICE_AI_STORY_BUILDER_YEARLY", mode: "subscription", billing: "yearly" },
  "soulprint_qr_code_kit:digital": { env: "STRIPE_PRICE_SOULPRINT_QR_KIT_DIGITAL", mode: "payment", billing: "one_time" },
  "soulprint_qr_code_kit:printed": { env: "STRIPE_PRICE_SOULPRINT_QR_KIT_PRINTED", mode: "payment", billing: "one_time" },
  "printed_memory_book:starting": { env: "STRIPE_PRICE_PRINTED_MEMORY_BOOK_STARTING", mode: "payment", billing: "one_time" },
  "white_glove_setup:standard": { env: "STRIPE_PRICE_WHITE_GLOVE_SETUP", mode: "payment", billing: "one_time" },
  "family_archive_migration:standard": { env: "STRIPE_PRICE_FAMILY_ARCHIVE_MIGRATION_STANDARD", mode: "payment", billing: "one_time" },
  "family_archive_migration:plus": { env: "STRIPE_PRICE_FAMILY_ARCHIVE_MIGRATION_PLUS", mode: "payment", billing: "one_time" },
  "family_archive_migration:large": { env: "STRIPE_PRICE_FAMILY_ARCHIVE_MIGRATION_LARGE", mode: "payment", billing: "one_time" }
};

Deno.serve(async (req) => {
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
    apiVersion: "2024-06-20"
  });

  const body = await req.json();
  const {
    priceId,
    userId,
    email,
    itemType = "plan",
    plan,
    addon,
    billing = "monthly",
    option
  } = body;

  if (!userId) {
    return new Response(JSON.stringify({ error: "Missing userId" }), { status: 400 });
  }

  let price = priceId as string | undefined;
  let mode: CheckoutMode = "subscription";
  let resolvedBilling: Billing = billing === "yearly" ? "yearly" : "monthly";
  let itemId = plan ?? addon ?? "";
  let itemName = itemId;

  if (!price) {
    if (itemType === "plan") {
      const envName = PLAN_PRICE_ENVS[`${plan}:${resolvedBilling}`];
      if (!envName) return new Response(JSON.stringify({ error: "Invalid plan or billing interval" }), { status: 400 });
      price = Deno.env.get(envName) ?? "";
      itemId = plan;
      itemName = plan;
    } else if (itemType === "addon") {
      const addonKey = option ? `${addon}:${option}` : `${addon}:${resolvedBilling}`;
      const mapping = ADDON_PRICE_ENVS[addonKey];
      if (!mapping) return new Response(JSON.stringify({ error: "Invalid add-on, option, or billing interval" }), { status: 400 });
      price = Deno.env.get(mapping.env) ?? "";
      mode = mapping.mode;
      resolvedBilling = mapping.billing;
      itemId = addon;
      itemName = addon;
    }
  }

  if (!price) {
    return new Response(JSON.stringify({ error: "Missing Stripe price ID" }), { status: 400 });
  }

  const siteUrl = Deno.env.get("SITE_URL") ?? "http://localhost:3000";
  const metadata = {
    userId,
    itemType,
    itemId,
    itemName,
    billing: resolvedBilling,
    optionId: option ?? ""
  };

  const session = await stripe.checkout.sessions.create({
    mode,
    customer_email: email,
    client_reference_id: userId,
    line_items: [{ price, quantity: 1 }],
    success_url: `${siteUrl}/dashboard?checkout=success`,
    cancel_url: `${siteUrl}/pricing?checkout=cancelled`,
    allow_promotion_codes: true,
    metadata,
    ...(mode === "subscription"
      ? { subscription_data: { metadata } }
      : { payment_intent_data: { metadata } })
  });

  return new Response(JSON.stringify({ url: session.url }), {
    headers: { "Content-Type": "application/json" }
  });
});
