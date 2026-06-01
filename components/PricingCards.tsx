import { plans } from "@/lib/pricing";

export function PricingCards() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {plans.map((plan) => (
        <article
          key={plan.id}
          className={plan.highlighted
            ? "brand-card relative rounded-brand border-2 border-seafoam p-8 shadow-glow"
            : "brand-card rounded-brand p-8"}
        >
          {plan.highlighted ? (
            <div className="absolute -top-4 left-8 rounded-full brand-gradient px-4 py-2 text-xs font-black uppercase tracking-widest text-white">
              Best for families
            </div>
          ) : null}
          <h3 className="text-2xl font-black text-navy">{plan.name}</h3>
          <p className="mt-2 text-sm font-bold uppercase tracking-[0.2em] text-seafoam">{plan.profiles}</p>
          <div className="mt-6">
            <span className="text-5xl font-black text-navy">${plan.monthly}</span>
            <span className="font-bold text-navy/60">/mo</span>
          </div>
          <p className="mt-2 text-sm text-navy/60">
            {plan.yearly === 0 ? "Free forever" : `$${plan.yearly}/year with 20% savings`}
          </p>
          <ul className="mt-8 grid gap-3">
            {plan.features.map((feature) => (
              <li key={feature} className="flex gap-3 text-sm leading-6 text-navy/75">
                <span className="mt-1 h-2 w-2 rounded-full bg-sunset" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <a
            href={plan.id === "free" ? "/auth/sign-up" : `/api/stripe/create-checkout-session?plan=${plan.id}&billing=monthly`}
            className={plan.highlighted
              ? "mt-8 block rounded-full bg-navy px-5 py-4 text-center font-black text-white"
              : "mt-8 block rounded-full border border-navy/15 px-5 py-4 text-center font-black text-navy"}
          >
            {plan.id === "free" ? "Start Free" : "Choose Plan"}
          </a>
        </article>
      ))}
    </div>
  );
}
