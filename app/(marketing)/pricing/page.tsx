import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AddOnCards, PricingCards } from "@/components/PricingCards";

export default function PricingPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-5 py-16">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="font-black uppercase tracking-[0.25em] text-seafoam">Soulprint Pricing</p>
          <h1 className="mt-4 text-5xl font-black tracking-tight text-navy">Preserve what matters without overcomplicating launch.</h1>
          <p className="mt-5 text-lg leading-8 text-navy/70">
            Three plans at launch: one free, two paid. Annual subscriptions save 20% compared with monthly billing.
          </p>
        </div>

        <PricingCards />

        <section className="mt-16 rounded-[2rem] bg-navy p-8 text-white">
          <h2 className="text-3xl font-black">Premium add-ons</h2>
          <p className="mt-3 max-w-2xl text-white/70">
            Add-ons keep the core plans simple while letting families expand storage, story help, migration, printing, and future estate features.
          </p>
          <AddOnCards />
        </section>
      </main>
      <Footer />
    </>
  );
}
