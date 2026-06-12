import Stripe from "https://esm.sh/stripe@14.25.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2024-06-20"
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false } }
);

function planFromPrice(priceId: string) {
  const legacy = [
    Deno.env.get("STRIPE_PRICE_FAMILY_LEGACY_MONTHLY"),
    Deno.env.get("STRIPE_PRICE_FAMILY_LEGACY_YEARLY")
  ];
  const archive = [
    Deno.env.get("STRIPE_PRICE_FOREVER_ARCHIVE_MONTHLY"),
    Deno.env.get("STRIPE_PRICE_FOREVER_ARCHIVE_YEARLY")
  ];

  if (legacy.includes(priceId)) {
    return {
      tier: "family_legacy",
      storage_limit_gb: 25,
      profile_limit: 5,
      upload_limit: null,
      estate_vault_enabled: false
    };
  }

  if (archive.includes(priceId)) {
    return {
      tier: "forever_archive",
      storage_limit_gb: 100,
      profile_limit: 25,
      upload_limit: null,
      estate_vault_enabled: false
    };
  }

  return {
    tier: "free",
    storage_limit_gb: 1,
    profile_limit: 1,
    upload_limit: 50,
    estate_vault_enabled: false
  };
}

function addOnFromPrice(priceId: string) {
  const mappings = [
    {
      id: "extra_25gb_storage",
      name: "Extra 25 GB Storage",
      prices: [
        Deno.env.get("STRIPE_PRICE_EXTRA_25GB_STORAGE_MONTHLY"),
        Deno.env.get("STRIPE_PRICE_EXTRA_25GB_STORAGE_YEARLY")
      ],
      type: "recurring",
      extra_storage_gb: 25,
      ai_story_builder_enabled: false,
      fulfillment_required: false
    },
    {
      id: "extra_100gb_storage",
      name: "Extra 100 GB Storage",
      prices: [
        Deno.env.get("STRIPE_PRICE_EXTRA_100GB_STORAGE_MONTHLY"),
        Deno.env.get("STRIPE_PRICE_EXTRA_100GB_STORAGE_YEARLY")
      ],
      type: "recurring",
      extra_storage_gb: 100,
      ai_story_builder_enabled: false,
      fulfillment_required: false
    },
    {
      id: "ai_story_builder",
      name: "AI Story Builder",
      prices: [
        Deno.env.get("STRIPE_PRICE_AI_STORY_BUILDER_MONTHLY"),
        Deno.env.get("STRIPE_PRICE_AI_STORY_BUILDER_YEARLY")
      ],
      type: "recurring",
      extra_storage_gb: 0,
      ai_story_builder_enabled: true,
      fulfillment_required: false
    },
    {
      id: "soulprint_qr_code_kit",
      name: "Soulprint QR Code Kit",
      prices: [
        Deno.env.get("STRIPE_PRICE_SOULPRINT_QR_KIT_DIGITAL"),
        Deno.env.get("STRIPE_PRICE_SOULPRINT_QR_KIT_PRINTED")
      ],
      type: "one_time",
      extra_storage_gb: 0,
      ai_story_builder_enabled: false,
      fulfillment_required: true
    },
    {
      id: "printed_memory_book",
      name: "Printed Memory Book",
      prices: [Deno.env.get("STRIPE_PRICE_PRINTED_MEMORY_BOOK_STARTING")],
      type: "one_time",
      extra_storage_gb: 0,
      ai_story_builder_enabled: false,
      fulfillment_required: true
    },
    {
      id: "white_glove_setup",
      name: "White-glove Setup",
      prices: [Deno.env.get("STRIPE_PRICE_WHITE_GLOVE_SETUP")],
      type: "one_time",
      extra_storage_gb: 0,
      ai_story_builder_enabled: false,
      fulfillment_required: true
    },
    {
      id: "family_archive_migration",
      name: "Family Archive Migration",
      prices: [
        Deno.env.get("STRIPE_PRICE_FAMILY_ARCHIVE_MIGRATION_STANDARD"),
        Deno.env.get("STRIPE_PRICE_FAMILY_ARCHIVE_MIGRATION_PLUS"),
        Deno.env.get("STRIPE_PRICE_FAMILY_ARCHIVE_MIGRATION_LARGE")
      ],
      type: "one_time",
      extra_storage_gb: 0,
      ai_story_builder_enabled: false,
      fulfillment_required: true
    }
  ];

  return mappings.find((mapping) => mapping.prices.includes(priceId));
}

async function updateSubscriptionFromStripe(subscriptionId: string, customerId = "") {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0]?.price.id ?? "";
  const metadata = subscription.metadata ?? {};
  const userId = metadata.userId;

  if (!userId) return;

  const itemType = metadata.itemType ?? "plan";

  if (itemType === "addon") {
    const addOn = addOnFromPrice(priceId);
    if (!addOn) return;

    await supabase.from("subscription_addons").upsert({
      user_id: userId,
      addon_id: addOn.id,
      addon_name: addOn.name,
      billing_type: addOn.type,
      billing_interval: metadata.billing ?? "monthly",
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      stripe_price_id: priceId,
      status: subscription.status,
      extra_storage_gb: addOn.extra_storage_gb,
      ai_story_builder_enabled: addOn.ai_story_builder_enabled,
      fulfillment_required: addOn.fulfillment_required,
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString()
    }, { onConflict: "user_id,addon_id,stripe_price_id" });

    return;
  }

  const mapped = planFromPrice(priceId);

  await supabase.from("subscriptions").upsert({
    user_id: userId,
    tier: mapped.tier,
    storage_limit_gb: mapped.storage_limit_gb,
    profile_limit: mapped.profile_limit,
    upload_limit: mapped.upload_limit,
    estate_vault_enabled: mapped.estate_vault_enabled,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    stripe_price_id: priceId,
    billing_status: subscription.status,
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    updated_at: new Date().toISOString()
  }, { onConflict: "user_id" });
}

async function recordOneTimePurchase(session: Stripe.Checkout.Session) {
  const metadata = session.metadata ?? {};
  const userId = metadata.userId ?? session.client_reference_id;
  if (!userId) return;

  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
  const priceId = lineItems.data[0]?.price?.id ?? "";
  const addOn = addOnFromPrice(priceId);
  if (!addOn) return;

  await supabase.from("subscription_addons").insert({
    user_id: userId,
    addon_id: addOn.id,
    addon_name: addOn.name,
    billing_type: "one_time",
    billing_interval: "one_time",
    stripe_customer_id: String(session.customer ?? ""),
    stripe_payment_intent_id: String(session.payment_intent ?? ""),
    stripe_price_id: priceId,
    status: "purchased",
    extra_storage_gb: addOn.extra_storage_gb,
    ai_story_builder_enabled: addOn.ai_story_builder_enabled,
    fulfillment_required: addOn.fulfillment_required,
    fulfillment_status: addOn.fulfillment_required ? "pending" : "not_required",
    purchased_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
}

Deno.serve(async (req) => {
  const signature = req.headers.get("Stripe-Signature");
  const body = await req.text();
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";

  if (!signature || !webhookSecret) {
    return new Response("Webhook not configured", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Stripe webhook error";
    return new Response(`Webhook signature verification failed: ${message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.mode === "subscription" && session.subscription) {
      await updateSubscriptionFromStripe(String(session.subscription), String(session.customer ?? ""));
    }

    if (session.mode === "payment") {
      await recordOneTimePurchase(session);
    }
  }

  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription;
    await updateSubscriptionFromStripe(subscription.id, String(subscription.customer ?? ""));
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const metadata = subscription.metadata ?? {};
    const userId = metadata.userId;
    const itemType = metadata.itemType ?? "plan";

    if (userId && itemType === "addon") {
      await supabase
        .from("subscription_addons")
        .update({
          status: "canceled",
          updated_at: new Date().toISOString()
        })
        .eq("user_id", userId)
        .eq("stripe_subscription_id", subscription.id);
    }

    if (userId && itemType === "plan") {
      await supabase
        .from("subscriptions")
        .update({
          tier: "free",
          storage_limit_gb: 1,
          profile_limit: 1,
          upload_limit: 50,
          billing_status: "canceled",
          updated_at: new Date().toISOString()
        })
        .eq("user_id", userId)
        .eq("stripe_subscription_id", subscription.id);
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" }
  });
});
