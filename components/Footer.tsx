import { SoulprintLogo } from "@/components/SoulprintLogo";

export function Footer() {
  return (
    <footer className="border-t border-navy/10 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <SoulprintLogo size="sm" />
          <p className="mt-4 max-w-md text-sm leading-7 text-navy/70">
            Soulprint preserves stories, photos, voices, documents, family history, and legacy instructions in one secure place.
          </p>
        </div>
        <div>
          <p className="font-black text-navy">Product</p>
          <div className="mt-4 grid gap-2 text-sm text-navy/70">
            <a href="/pricing">Pricing</a>
            <a href="/security">Trust & Security</a>
            <a href="/dashboard">Dashboard</a>
          </div>
        </div>
        <div>
          <p className="font-black text-navy">Brand Promise</p>
          <p className="mt-4 text-sm leading-7 text-navy/70">
            Visionary. Meaningful. Timeless. Built by Chasdo Creative Worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
}
