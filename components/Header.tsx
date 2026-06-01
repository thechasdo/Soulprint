import Link from "next/link";
import { SoulprintLogo } from "@/components/SoulprintLogo";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-navy/10 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <SoulprintLogo size="sm" />
        <nav className="hidden items-center gap-8 text-sm font-bold text-navy/75 md:flex">
          <Link href="/pricing">Pricing</Link>
          <Link href="/security">Security</Link>
          <Link href="/dashboard">Dashboard</Link>
        </nav>
        <Link
          href="/auth/sign-up"
          className="rounded-full bg-navy px-5 py-3 text-sm font-black text-white shadow-glow transition hover:-translate-y-0.5"
        >
          Create a Soulprint
        </Link>
      </div>
    </header>
  );
}
