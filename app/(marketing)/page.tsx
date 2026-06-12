import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PricingCards } from "@/components/PricingCards";
import { SoulprintLogo } from "@/components/SoulprintLogo";
import { Archive, BookHeart, Fingerprint, LockKeyhole, Search, ShieldCheck, Sparkles, Users } from "lucide-react";

const trust = [
  { icon: ShieldCheck, title: "Private by default", text: "Family memories are protected with account-based access and database-level security policies." },
  { icon: Search, title: "Search every memory", text: "Photos, letters, audio, video, and documents are designed to be indexed so families can find what matters." },
  { icon: Users, title: "Family permissions", text: "Owners, admins, editors, contributors, viewers, and legacy contacts have separate access levels." },
  { icon: Archive, title: "Built for longevity", text: "Soulprint is designed around exports, backups, and a long-term preservation pledge." }
];

const features = [
  "Soulprint pages with custom privacy",
  "Timeline stories and milestone chapters",
  "Photo, video, audio, letter, and document vault",
  "Family tree and Ancestry profile link fields",
  "Guestbook and tribute moderation",
  "Estate Vault built behind a disabled feature flag",
  "Stripe-ready monthly and yearly subscriptions",
  "Upload indexing queue for OCR/transcription/search"
];

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <div className="mb-8">
              <SoulprintLogo size="lg" showText={false} href={undefined} />
            </div>
            <p className="mb-5 inline-flex rounded-full bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.22em] text-seafoam shadow-glow">
              Visionary • Meaningful • Timeless
            </p>
            <h1 className="max-w-4xl text-balance text-5xl font-black tracking-tight text-navy md:text-7xl">
              Memories should not fade when life moves on.
            </h1>
            <p className="mt-6 max-w-2xl text-xl leading-9 text-navy/72">
              Soulprint is a secure family legacy platform where stories, photos, voices, documents, timelines, and family history live together beautifully.
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <a href="/auth/sign-up" className="rounded-full bg-navy px-8 py-4 text-center font-black text-white shadow-glow">
                Create a Soulprint
              </a>
              <a href="/pricing" className="rounded-full border border-navy/15 bg-white px-8 py-4 text-center font-black text-navy">
                View Pricing
              </a>
            </div>
          </div>

          <div className="brand-card overflow-hidden rounded-[2.5rem] p-5">
            <div className="rounded-[2rem] bg-gradient-to-br from-white via-cream to-white p-6">
              <div className="flex items-center justify-between">
                <SoulprintLogo size="sm" />
                <span className="rounded-full bg-seafoam/15 px-4 py-2 text-xs font-black uppercase tracking-widest text-seafoam">
                  Secure Vault
                </span>
              </div>
              <div className="mt-8 grid gap-4">
                <div className="rounded-3xl bg-white p-5 shadow-glow">
                  <p className="text-sm font-black uppercase tracking-widest text-sunset">Featured Memory</p>
                  <p className="mt-2 text-2xl font-black text-navy">Grandma’s Christmas story</p>
                  <p className="mt-2 text-sm leading-6 text-navy/70">Audio transcribed, tagged, and linked to the family timeline.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-navy p-5 text-white">
                    <BookHeart className="h-8 w-8 text-sunset" />
                    <p className="mt-4 text-3xl font-black">248</p>
                    <p className="text-sm text-white/70">Memories saved</p>
                  </div>
                  <div className="rounded-3xl bg-white p-5">
                    <Fingerprint className="h-8 w-8 text-seafoam" />
                    <p className="mt-4 text-3xl font-black text-navy">12</p>
                    <p className="text-sm text-navy/60">Family profiles</p>
                  </div>
                </div>
                <div className="rounded-3xl border border-navy/10 bg-white p-5">
                  <p className="font-black text-navy">Search</p>
                  <p className="mt-2 rounded-2xl bg-cream px-4 py-3 text-sm text-navy/60">
                    “Find the letter Dad wrote about Mississippi”
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16">
          <div className="mb-10 max-w-3xl">
            <p className="font-black uppercase tracking-[0.25em] text-seafoam">Why Soulprint is different</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-navy md:text-5xl">
              Not just a page. A living Soulprint and family archive.
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {trust.map((item) => (
              <div key={item.title} className="brand-card physics-spring rounded-brand p-6">
                <item.icon className="h-9 w-9 text-sunset" />
                <h3 className="mt-5 text-xl font-black text-navy">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-navy/70">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-navy py-20 text-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <Sparkles className="h-10 w-10 text-sunset" />
              <h2 className="mt-4 text-4xl font-black tracking-tight">Built to feel iconic from day one.</h2>
              <p className="mt-5 leading-8 text-white/70">
                The product uses the Soulprint logo across the brand, dashboard, metadata, and sharing surfaces so users always feel they are inside one trusted experience.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {features.map((feature) => (
                <div key={feature} className="rounded-3xl border border-white/10 bg-white/8 p-5 font-bold text-white/85">
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20">
          <div className="mb-10 text-center">
            <p className="font-black uppercase tracking-[0.25em] text-seafoam">Simple launch pricing</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-navy">Start with three tiers. Scale to five later.</h2>
          </div>
          <PricingCards />
        </section>
      </main>
      <Footer />
    </>
  );
}
