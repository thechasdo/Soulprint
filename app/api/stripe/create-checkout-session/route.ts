import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Stripe from "stripe";

const stripeSecret = process.env.STRIPE_SECRET_KEY;

export async function GET(request: NextRequest) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  if (!stripeSecret) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 500 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

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
          // Safe to ignore in GET redirects.
        }
      },
    },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    const redirectTo = encodeURIComponent("/pricing");
    return NextResponse.redirect(`${siteUrl}/auth/sign-in?redirect=${redirectTo}`);
  }

  const stripe = new Stripe(stripeSecret);
  const plan = request.nextUrl.searchParams.get("plan");
  const billing = request.nextUrl.searchParams.get("billing") ?? "monthly";

  const priceMap: Record<string, string | undefined> = {
    "family_legacy:monthly": process.env.STRIPE_PRICE_FAMILY_LEGACY_MONTHLY,
    "family_legacy:yearly": process.env.STRIPE_PRICE_FAMILY_LEGACY_YEARLY,
    "forever_archive:monthly": process.env.STRIPE_PRICE_FOREVER_ARCHIVE_MONTHLY,
    "forever_archive:yearly": process.env.STRIPE_PRICE_FOREVER_ARCHIVE_YEARLY,
  };

  const price = priceMap[`${plan}:${billing}`];

  if (!price) {
    return NextResponse.json({ error: "Invalid plan or missing Stripe price." }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    success_url: `${siteUrl}/dashboard?checkout=success`,
    cancel_url: `${siteUrl}/pricing?checkout=cancelled`,
    allow_promotion_codes: true,
    customer_email: user.email,
    client_reference_id: user.id,
    metadata: {
      user_id: user.id,
      plan: String(plan),
      billing: String(billing),
    },
  });

  return NextResponse.redirect(session.url ?? `${siteUrl}/pricing`);
}
