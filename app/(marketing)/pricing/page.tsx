import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PricingCards } from "@/components/PricingCards";
import { addOns } from "@/lib/pricing";

export default function PricingPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-5 py-16">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="font-black uppercase tracking-[0.25em] text-seafoam">Soulprint Pricing</p>
          <h1 className="mt-4 text-5xl font-black tracking-tight text-navy">Preserve what matters without overcomplicating launch.</h1>
          <p className="mt-5 text-lg leading-8 text-navy/70">
            Three plans at launch: one free, two paid. Yearly plans save 20%.
          </p>
        </div>
        <PricingCards />

        <section className="mt-16 rounded-[2rem] bg-navy p-8 text-white">
          <h2 className="text-3xl font-black">Premium add-ons</h2>
          <p className="mt-3 max-w-2xl text-white/70">
            Add-ons keep the core plans simple while letting serious families expand storage, AI help, migration, printing, and future estate features.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {addOns.map((addOn) => (
              <div key={addOn.name} className="rounded-3xl border border-white/10 bg-white/8 p-5">
                <p className="font-black">{addOn.name}</p>
                <p className="mt-2 text-sm text-white/65">{addOn.price}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
