"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { SoulprintLogo } from "@/components/SoulprintLogo";
import { Archive, BookHeart, UploadCloud, Users, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [profileCount, setProfileCount] = useState<number | null>(null);
  const [assetCount, setAssetCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/sign-in");
        return;
      }
      setUser(user);

      // Fetch actual counts
      const { count: pCount } = await supabase
        .from("soulprint_profiles")
        .select("*", { count: "exact", head: true });

      const { count: aCount } = await supabase
        .from("assets")
        .select("*", { count: "exact", head: true });

      setProfileCount(pCount || 0);
      setAssetCount(aCount || 0);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchDashboardData();
  }, []);



  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth/sign-in");
    router.refresh();
  };

  const cards = [
    {
      icon: BookHeart,
      label: "Soulprint Profiles",
      value: `${profileCount !== null ? profileCount : "..."} Active Profiles`,
      description: "Manage Soulprint Profiles, biographical records, and family branches.",
      link: "/dashboard/profiles"
    },
    {
      icon: UploadCloud,
      label: "Secure Vault",
      value: `${assetCount !== null ? assetCount : "..."} Uploaded Assets`,
      description: "Securely store letters, audio memories, scans, and family heirlooms.",
      link: "/dashboard/vault"
    },
    {
      icon: Archive,
      label: "Estate Vault",
      value: "Legal Prep Stage",
      description: "Wills, trusts, and executor rules ready behind private feature flags.",
      link: "/dashboard/vault"
    },
    {
      icon: Users,
      label: "Family Network",
      value: "1 Active Circle",
      description: "Invite family members, legacy contacts, and future executors.",
      link: "/dashboard/profiles"
    }
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div className="text-center">
          <SoulprintLogo size="sm" />
          <p className="mt-4 font-black text-navy text-lg animate-pulse">Entering command center...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-cream/30">
      <aside className="fixed left-0 top-0 hidden h-screen w-72 border-r border-navy/10 bg-white p-6 lg:flex flex-col justify-between">
        <div>
          <SoulprintLogo size="sm" />
          <nav className="mt-10 grid gap-3 text-sm font-black text-navy/70">
            <a className="rounded-2xl bg-cream px-4 py-3 text-navy" href="/dashboard">Overview</a>
            <a className="rounded-2xl px-4 py-3 hover:bg-cream/50 transition-colors" href="/dashboard/profiles">Profiles</a>
            <a className="rounded-2xl px-4 py-3 hover:bg-cream/50 transition-colors" href="/dashboard/vault">Estate Vault</a>
          </nav>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 rounded-2xl border border-navy/15 px-4 py-3 text-sm font-black text-navy/70 hover:bg-sunset/10 hover:text-sunset hover:border-sunset/20 transition-all"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </aside>
      
      <section className="lg:pl-72">
        <div className="mx-auto max-w-6xl px-5 py-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-black uppercase tracking-[0.25em] text-seafoam">Soulprint Dashboard</p>
              <h1 className="mt-2 text-4xl font-black text-navy">
                Welcome back, {user?.user_metadata?.display_name || user?.email?.split("@")[0]}
              </h1>
            </div>
            <SoulprintLogo size="sm" showText={false} />
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {cards.map((card) => (
              <a
                href={card.link}
                key={card.label}
                className="brand-card rounded-brand p-7 hover:translate-y-[-4px] hover:shadow-glow transition-all duration-300 block cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <card.icon className="h-10 w-10 text-sunset group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-black uppercase tracking-widest text-seafoam bg-seafoam/10 px-3 py-1.5 rounded-full">
                    {card.value}
                  </span>
                </div>
                <h2 className="mt-5 text-2xl font-black text-navy group-hover:text-seafoam transition-colors">
                  {card.label}
                </h2>
                <p className="mt-3 leading-7 text-navy/70">{card.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
