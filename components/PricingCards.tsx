import {
  addOns,
  getOneTimeAddOnOption,
  isFutureAddOn,
  isOneTimeAddOn,
  isRecurringAddOn,
  plans,
  PRICING_REVISION
} from "@/lib/pricing";

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
          {plan.badge ? (
            <div className={plan.highlighted
              ? "absolute -top-4 left-8 rounded-full brand-gradient px-4 py-2 text-xs font-black uppercase tracking-widest text-white"
              : "mb-4 inline-flex rounded-full bg-cream px-4 py-2 text-xs font-black uppercase tracking-widest text-seafoam"}
            >
              {plan.badge}
            </div>
          ) : null}

          <h3 className="text-2xl font-black text-navy">{plan.name}</h3>
          <p className="mt-2 text-sm font-bold text-navy/60">Best for {plan.bestFor}</p>
          <p className="mt-2 text-sm font-bold uppercase tracking-[0.2em] text-seafoam">{plan.profiles}</p>

          <div className="mt-6">
            <span className="text-5xl font-black text-navy">${plan.monthly}</span>
            <span className="font-bold text-navy/60">/mo</span>
          </div>
          <p className="mt-2 text-sm text-navy/60">
            {plan.yearly === 0 ? "Free forever" : `$${plan.yearly}/year with ${PRICING_REVISION.annualSavingsClaim}`}
          </p>

          <ul className="mt-8 grid gap-3">
            {plan.features.map((feature) => (
              <li key={feature} className="flex gap-3 text-sm leading-6 text-navy/75">
                <span className="mt-1 h-2 w-2 rounded-full bg-sunset" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          {plan.id === "free" ? (
            <a
              href="/auth/sign-up"
              className="mt-8 block rounded-full border border-navy/15 px-5 py-4 text-center font-black text-navy"
            >
              Start Free
            </a>
          ) : (
            <div className="mt-8 grid gap-3">
              <a
                href={`/api/stripe/create-checkout-session?type=plan&plan=${plan.id}&billing=monthly`}
                className={plan.highlighted
                  ? "block rounded-full bg-navy px-5 py-4 text-center font-black text-white"
                  : "block rounded-full border border-navy/15 px-5 py-4 text-center font-black text-navy"}
              >
                Choose Monthly
              </a>
              <a
                href={`/api/stripe/create-checkout-session?type=plan&plan=${plan.id}&billing=yearly`}
                className="block rounded-full border border-navy/15 bg-white px-5 py-4 text-center font-black text-navy"
              >
                Choose Yearly
              </a>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}

export function AddOnCards() {
  return (
    <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {addOns.map((addOn) => (
        <div key={addOn.id} className="rounded-3xl border border-white/10 bg-white/8 p-5">
          <p className="font-black">{addOn.name}</p>
          <p className="mt-2 text-sm text-white/65">{addOn.price}</p>
          <p className="mt-3 text-sm leading-6 text-white/70">{addOn.notes}</p>

          {isRecurringAddOn(addOn) ? (
            <div className="mt-5 grid gap-2">
              <a
                href={`/api/stripe/create-checkout-session?type=addon&addon=${addOn.id}&billing=monthly`}
                className="rounded-full bg-white px-4 py-3 text-center text-sm font-black text-navy"
              >
                Add Monthly
              </a>
              <a
                href={`/api/stripe/create-checkout-session?type=addon&addon=${addOn.id}&billing=yearly`}
                className="rounded-full border border-white/20 px-4 py-3 text-center text-sm font-black text-white"
              >
                Add Yearly
              </a>
            </div>
          ) : null}

          {isOneTimeAddOn(addOn) ? (
            <div className="mt-5 grid gap-2">
              {addOn.options.map((option) => (
                <a
                  key={option.id}
                  href={`/api/stripe/create-checkout-session?type=addon&addon=${addOn.id}&option=${getOneTimeAddOnOption(addOn, option.id).id}`}
                  className="rounded-full bg-white px-4 py-3 text-center text-sm font-black text-navy"
                >
                  Buy {option.priceLabel}
                </a>
              ))}
            </div>
          ) : null}

          {isFutureAddOn(addOn) ? (
            <p className="mt-5 rounded-full border border-white/15 px-4 py-3 text-center text-sm font-black text-white/70">
              Coming later
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
