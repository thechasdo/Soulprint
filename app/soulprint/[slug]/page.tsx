import { SoulprintLogo } from "@/components/SoulprintLogo";
export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Globe, Lock, Calendar, BookOpen, Volume2 } from "lucide-react";
import { AudioWaveformPlayer } from "@/components/AudioWaveformPlayer";

import { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("soulprint_profiles")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!profile || profile.visibility === "private") {
    return {
      title: "Soulprint",
      description: "A secure Soulprint and family archive where memories live on.",
    };
  }

  const birthYear = profile.birth_date ? new Date(profile.birth_date).getFullYear() : "";
  const deathYear = profile.death_date ? new Date(profile.death_date).getFullYear() : "Present";
  const lifeSpan = birthYear || deathYear ? ` (${birthYear} — ${deathYear})` : "";

  return {
    title: `${profile.full_name}${lifeSpan} — Soulprint`,
    description: profile.headline || `Explore the Soulprint for ${profile.full_name}: stories, biography, timeline, and family memories on Soulprint.`,
    openGraph: {
      title: `${profile.full_name}${lifeSpan} — Soulprint`,
      description: profile.headline || `Explore stories, photos, and memories of ${profile.full_name}.`,
      type: "profile",
      siteName: "Soulprint",
      images: [
        {
          url: "/soulprint-logo.png",
          width: 1200,
          height: 1200,
          alt: `${profile.full_name} Soulprint on Soulprint`,
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${profile.full_name}${lifeSpan} — Soulprint`,
      description: profile.headline || `Explore stories, photos, and memories of ${profile.full_name}.`,
      images: ["/soulprint-logo.png"],
    },
  };
}

export default async function PublicSoulprintPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch the profile from public.soulprint_profiles using slug
  const { data: profile, error } = await supabase
    .from("soulprint_profiles")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !profile) {
    return notFound();
  }

  // Double check visibility constraints (if private, return notFound unless user has access, handled by RLS but good to have a safe UI check)
  if (profile.visibility === "private") {
    // Check if the current user is the creator
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== profile.created_by) {
      return notFound();
    }
  }

  // Fetch assets associated with this profile
  const { data: assets } = await supabase
    .from("assets")
    .select("*")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen px-5 py-12 bg-cream/20">
      <div className="mx-auto max-w-4xl">
        <div className="flex justify-between items-center">
          <SoulprintLogo size="sm" />
          <span className="flex items-center gap-1.5 rounded-full bg-white border border-navy/10 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-navy/70">
            <Globe className="h-3.5 w-3.5 text-seafoam" /> {profile.visibility} Soulprint
          </span>
        </div>

        <section className="brand-card mt-10 rounded-[2.5rem] p-10 md:p-12">
          <div className="text-center">
            <p className="font-black uppercase tracking-[0.25em] text-seafoam">Memories Live On</p>
            <h1 className="mt-4 text-5xl font-black text-navy">{profile.full_name}</h1>
            
            {profile.headline && (
              <p className="mt-3 text-lg font-bold text-navy/60 italic">
                &ldquo;{profile.headline}&rdquo;
              </p>
            )}

            {(profile.birth_date || profile.death_date) && (
              <div className="mt-6 flex justify-center items-center gap-2 text-sm font-black tracking-widest uppercase text-sunset bg-sunset/5 border border-sunset/10 px-5 py-2 rounded-full inline-flex">
                <Calendar className="h-4 w-4" />
                <span>
                  {profile.birth_date ? new Date(profile.birth_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : "?"}
                </span>
                <span className="mx-1">—</span>
                <span>
                  {profile.death_date ? new Date(profile.death_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : "Present"}
                </span>
              </div>
            )}
          </div>

          {profile.biography && (
            <div className="mt-10 border-t border-navy/5 pt-10">
              <h3 className="text-xl font-black text-navy flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-seafoam" /> Biography & Life Story
              </h3>
              <p className="mt-4 leading-8 text-navy/75 whitespace-pre-line font-medium">
                {profile.biography}
              </p>
            </div>
          )}

          {/* Voice Archive & Memories Section */}
          {assets && assets.length > 0 && (
            <div className="mt-10 border-t border-navy/5 pt-10">
              <h3 className="text-xl font-black text-navy flex items-center gap-2 mb-6">
                <Volume2 className="h-5 w-5 text-seafoam" /> Voice Journals & Oral History
              </h3>
              <div className="grid gap-6">
                {assets
                  .filter((asset) => asset.asset_type === "voice" || asset.mime_type.startsWith("audio/"))
                  .map((asset) => (
                    <AudioWaveformPlayer
                      key={asset.id}
                      src={`/api/uploads/download?path=${encodeURIComponent(asset.storage_path)}`}
                      title={asset.original_filename.replace(/\.[^/.]+$/, "")}
                    />
                  ))}
                {assets.filter((asset) => asset.asset_type === "voice" || asset.mime_type.startsWith("audio/")).length === 0 && (
                  <p className="text-sm font-bold text-navy/50 italic">No voice recordings uploaded yet.</p>
                )}
              </div>
            </div>
          )}

          {/* Genealogy Badges */}
          {(profile.ancestry_url || profile.familysearch_url || profile.myheritage_url) && (
            <div className="mt-10 border-t border-navy/5 pt-8">
              <h4 className="text-xs font-black uppercase tracking-widest text-navy/50">Genealogy Records</h4>
              <div className="mt-4 flex flex-wrap gap-3">
                {profile.ancestry_url && (
                  <a
                    href={profile.ancestry_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-cream border border-navy/10 px-4 py-2 text-xs font-black text-navy hover:bg-navy hover:text-white transition-all"
                  >
                    Ancestry Profile ↗
                  </a>
                )}
                {profile.familysearch_url && (
                  <a
                    href={profile.familysearch_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-cream border border-navy/10 px-4 py-2 text-xs font-black text-navy hover:bg-navy hover:text-white transition-all"
                  >
                    FamilySearch Tree ↗
                  </a>
                )}
                {profile.myheritage_url && (
                  <a
                    href={profile.myheritage_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-cream border border-navy/10 px-4 py-2 text-xs font-black text-navy hover:bg-navy hover:text-white transition-all"
                  >
                    MyHeritage Record ↗
                  </a>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
