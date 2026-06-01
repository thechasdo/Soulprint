import Stripe from "https://esm.sh/stripe@14.25.0?target=deno";

Deno.serve(async (req) => {
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
    apiVersion: "2024-06-20"
  });

  const { priceId, userId, email } = await req.json();

  if (!priceId || !userId) {
    return new Response(JSON.stringify({ error: "Missing priceId or userId" }), { status: 400 });
  }

  const siteUrl = Deno.env.get("SITE_URL") ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: email,
    client_reference_id: userId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${siteUrl}/dashboard?checkout=success`,
    cancel_url: `${siteUrl}/pricing?checkout=cancelled`,
    allow_promotion_codes: true
  });

  return new Response(JSON.stringify({ url: session.url }), {
    headers: { "Content-Type": "application/json" }
  });
});
