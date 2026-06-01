import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecret = process.env.STRIPE_SECRET_KEY;

export async function GET(request: NextRequest) {
  if (!stripeSecret) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 500 });
  }

  const stripe = new Stripe(stripeSecret);
  const plan = request.nextUrl.searchParams.get("plan");
  const billing = request.nextUrl.searchParams.get("billing") ?? "monthly";

  const priceMap: Record<string, string | undefined> = {
    "family_legacy:monthly": process.env.STRIPE_PRICE_FAMILY_LEGACY_MONTHLY,
    "family_legacy:yearly": process.env.STRIPE_PRICE_FAMILY_LEGACY_YEARLY,
    "forever_archive:monthly": process.env.STRIPE_PRICE_FOREVER_ARCHIVE_MONTHLY,
    "forever_archive:yearly": process.env.STRIPE_PRICE_FOREVER_ARCHIVE_YEARLY
  };

  const price = priceMap[`${plan}:${billing}`];

  if (!price) {
    return NextResponse.json({ error: "Invalid plan or missing Stripe price." }, { status: 400 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  let clientReferenceId: string | undefined = undefined;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    const { createServerClient } = await import("@supabase/ssr");
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll().map((c) => ({ name: c.name, value: c.value }));
        },
        setAll(cookieInstances) {
          try {
            cookieInstances.forEach((c) => cookieStore.set(c.name, c.value, c.options));
          } catch {
            // Safe to ignore in GET redirects
          }
        },
      },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      clientReferenceId = user.id;
    }
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    success_url: `${siteUrl}/dashboard?checkout=success`,
    cancel_url: `${siteUrl}/pricing?checkout=cancelled`,
    allow_promotion_codes: true,
    client_reference_id: clientReferenceId
  });

  return NextResponse.redirect(session.url ?? `${siteUrl}/pricing`);
}
