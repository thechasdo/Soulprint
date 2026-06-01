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

  if (legacy.includes(priceId)) return { tier: "family_legacy", storage_limit_gb: 25, profile_limit: 5 };
  if (archive.includes(priceId)) return { tier: "forever_archive", storage_limit_gb: 100, profile_limit: 25 };
  return { tier: "free", storage_limit_gb: 1, profile_limit: 1 };
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
    return new Response(`Webhook signature verification failed: ${error.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id;
    const subscriptionId = String(session.subscription ?? "");

    if (userId && subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const priceId = subscription.items.data[0]?.price.id ?? "";
      const mapped = planFromPrice(priceId);

      await supabase.from("subscriptions").upsert({
        user_id: userId,
        tier: mapped.tier,
        storage_limit_gb: mapped.storage_limit_gb,
        profile_limit: mapped.profile_limit,
        stripe_customer_id: String(session.customer ?? ""),
        stripe_subscription_id: subscriptionId,
        billing_status: subscription.status,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id" });
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" }
  });
});
