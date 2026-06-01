"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { SoulprintLogo } from "@/components/SoulprintLogo";
import { Plus, Edit2, Trash2, Globe, Lock, EyeOff, UserPlus } from "lucide-react";

interface Profile {
  id: string;
  full_name: string;
  slug: string;
  headline: string | null;
  birth_date: string | null;
  death_date: string | null;
  biography: string | null;
  visibility: "public" | "unlisted" | "family" | "private";
  ancestry_url: string | null;
  familysearch_url: string | null;
  myheritage_url: string | null;
}

export default function ProfilesPage() {
  const supabase = createClient();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  // Form states
  const [fullName, setFullName] = useState("");
  const [slug, setSlug] = useState("");
  const [headline, setHeadline] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [deathDate, setDeathDate] = useState("");
  const [biography, setBiography] = useState("");
  const [visibility, setVisibility] = useState<Profile["visibility"]>("private");
  const [ancestryUrl, setAncestryUrl] = useState("");
  const [familysearchUrl, setFamilysearchUrl] = useState("");
  const [myheritageUrl, setMyheritageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("soulprint_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (err: any) {
      console.error("Error fetching profiles:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingProfile(null);
    setFullName("");
    setSlug("");
    setHeadline("");
    setBirthDate("");
    setDeathDate("");
    setBiography("");
    setVisibility("private");
    setAncestryUrl("");
    setFamilysearchUrl("");
    setMyheritageUrl("");
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (profile: Profile) => {
    setEditingProfile(profile);
    setFullName(profile.full_name);
    setSlug(profile.slug);
    setHeadline(profile.headline || "");
    setBirthDate(profile.birth_date || "");
    setDeathDate(profile.death_date || "");
    setBiography(profile.biography || "");
    setVisibility(profile.visibility);
    setAncestryUrl(profile.ancestry_url || "");
    setFamilysearchUrl(profile.familysearch_url || "");
    setMyheritageUrl(profile.myheritage_url || "");
    setError(null);
    setIsModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated.");

      // Check if family exists or create a default family for user
      let familyId = "";
      const { data: families, error: familyError } = await supabase
        .from("families")
        .select("id")
        .eq("owner_id", user.id)
        .limit(1);

      if (familyError) throw familyError;

      if (families && families.length > 0) {
        familyId = families[0].id;
      } else {
        // Create default family
        const { data: newFamily, error: createFamilyError } = await supabase
          .from("families")
          .insert({
            name: `${fullName}'s Family`,
            owner_id: user.id,
          })
          .select()
          .single();

        if (createFamilyError) throw createFamilyError;
        familyId = newFamily.id;

        // Add family membership
        await supabase.from("family_memberships").insert({
          family_id: familyId,
          user_id: user.id,
          role: "owner",
        });
      }

      const profileData = {
        family_id: familyId,
        full_name: fullName,
        slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
        headline: headline || null,
        birth_date: birthDate || null,
        death_date: deathDate || null,
        biography: biography || null,
        visibility,
        ancestry_url: ancestryUrl || null,
        familysearch_url: familysearchUrl || null,
        myheritage_url: myheritageUrl || null,
        created_by: user.id,
      };

      if (editingProfile) {
        const { error } = await supabase
          .from("soulprint_profiles")
          .update(profileData)
          .eq("id", editingProfile.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("soulprint_profiles")
          .insert(profileData);

        if (error) throw error;
      }

      setIsModalOpen(false);
      fetchProfiles();
    } catch (err: any) {
      setError(err.message || "An error occurred while saving profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProfile = async (id: string) => {
    if (!confirm("Are you sure you want to delete this profile? All timeline events and tributes will be permanently deleted.")) return;

    try {
      const { error } = await supabase
        .from("soulprint_profiles")
        .delete()
        .eq("id", id);

      if (error) throw error;
      fetchProfiles();
    } catch (err: any) {
      alert(err.message || "An error occurred while deleting profile.");
    }
  };

  const getVisibilityIcon = (v: Profile["visibility"]) => {
    switch (v) {
      case "public": return <Globe className="h-4 w-4 text-seafoam" />;
      case "unlisted": return <EyeOff className="h-4 w-4 text-sunset" />;
      case "family": return <UserPlus className="h-4 w-4 text-navy" />;
      default: return <Lock className="h-4 w-4 text-navy/50" />;
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-5 py-12">
      <div className="flex items-center justify-between">
        <SoulprintLogo size="sm" />
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 rounded-full bg-navy px-5 py-3 text-sm font-black text-white hover:bg-navy/90 transition-colors shadow-glow"
        >
          <Plus className="h-4 w-4" /> Add Profile
        </button>
      </div>

      <h1 className="mt-8 text-4xl font-black text-navy">Soulprint Profiles</h1>
      <p className="mt-3 max-w-2xl leading-8 text-navy/70">
        Create profiles for loved ones, living legacy pages, and family timeline branches. Each profile can connect to relationships, Ancestry links, stories, and uploaded assets.
      </p>

      {loading ? (
        <div className="mt-12 text-center text-navy/60 font-bold">Loading profiles...</div>
      ) : profiles.length === 0 ? (
        <div className="mt-8 rounded-brand border border-dashed border-navy/20 bg-white p-12 text-center">
          <p className="font-black text-navy text-xl">No profiles created yet</p>
          <p className="mt-2 text-sm text-navy/60 max-w-md mx-auto">
            Get started by creating your first legacy profile. You can add photos, timelines, and biographical links once the profile is created.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-black text-white hover:bg-navy/90 transition-colors"
          >
            <Plus className="h-4 w-4" /> Create First Profile
          </button>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => (
            <div key={profile.id} className="brand-card rounded-brand p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1 rounded-full bg-cream px-3 py-1 text-xs font-black uppercase tracking-wider text-navy/70">
                    {getVisibilityIcon(profile.visibility)} {profile.visibility}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEditModal(profile)}
                      className="p-2 rounded-full hover:bg-cream text-navy/70 hover:text-navy transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProfile(profile.id)}
                      className="p-2 rounded-full hover:bg-sunset/10 text-sunset/70 hover:text-sunset transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <h3 className="mt-4 text-2xl font-black text-navy">{profile.full_name}</h3>
                {profile.headline && <p className="mt-1 text-sm font-bold text-navy/60">{profile.headline}</p>}
                {(profile.birth_date || profile.death_date) && (
                  <p className="mt-2 text-xs font-black tracking-widest uppercase text-seafoam">
                    {profile.birth_date ? new Date(profile.birth_date).getFullYear() : "?"} — {profile.death_date ? new Date(profile.death_date).getFullYear() : "Present"}
                  </p>
                )}
                {profile.biography && (
                  <p className="mt-4 text-sm leading-6 text-navy/70 line-clamp-3">{profile.biography}</p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-navy/5 flex items-center justify-between">
                <a
                  href={`/memorial/${profile.slug}`}
                  target="_blank"
                  className="text-xs font-black tracking-widest uppercase text-navy hover:text-seafoam transition-colors"
                >
                  View Public Page →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 backdrop-blur-sm p-5 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl p-8 shadow-glow max-h-[90vh] overflow-y-auto">
            <h2 className="text-3xl font-black text-navy">
              {editingProfile ? "Edit Profile" : "Create New Profile"}
            </h2>
            <form onSubmit={handleSaveProfile} className="mt-6 grid gap-6">
              {error && (
                <div className="rounded-2xl bg-sunset/10 p-4 text-sm font-bold text-sunset">
                  {error}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-xs font-black uppercase tracking-wider text-navy/60">Full Name</label>
                  <input
                    className="rounded-2xl border border-navy/10 px-4 py-3 focus:border-navy focus:outline-none text-navy font-bold"
                    type="text"
                    placeholder="e.g. Eleanor Vance"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (!editingProfile) {
                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-"));
                      }
                    }}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-black uppercase tracking-wider text-navy/60">Slug (URL identifier)</label>
                  <input
                    className="rounded-2xl border border-navy/10 px-4 py-3 focus:border-navy focus:outline-none text-navy font-mono text-sm"
                    type="text"
                    placeholder="eleanor-vance"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-black uppercase tracking-wider text-navy/60">Headline / Short Description</label>
                <input
                  className="rounded-2xl border border-navy/10 px-4 py-3 focus:border-navy focus:outline-none text-navy font-bold"
                  type="text"
                  placeholder="e.g. Beloved Grandmother, Botanist, and Painter"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-xs font-black uppercase tracking-wider text-navy/60">Birth Date</label>
                  <input
                    className="rounded-2xl border border-navy/10 px-4 py-3 focus:border-navy focus:outline-none text-navy font-bold"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-black uppercase tracking-wider text-navy/60">Death Date (Leave blank if living)</label>
                  <input
                    className="rounded-2xl border border-navy/10 px-4 py-3 focus:border-navy focus:outline-none text-navy font-bold"
                    type="date"
                    value={deathDate}
                    onChange={(e) => setDeathDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-black uppercase tracking-wider text-navy/60">Biography</label>
                <textarea
                  rows={4}
                  className="rounded-2xl border border-navy/10 px-4 py-3 focus:border-navy focus:outline-none text-navy font-medium leading-relaxed"
                  placeholder="Write a brief story of their life, achievements, and legacy..."
                  value={biography}
                  onChange={(e) => setBiography(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-black uppercase tracking-wider text-navy/60">Visibility Setting</label>
                <select
                  className="rounded-2xl border border-navy/10 px-4 py-3 focus:border-navy focus:outline-none text-navy font-bold"
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as Profile["visibility"])}
                >
                  <option value="private">Private (Only you and invited family members)</option>
                  <option value="family">Family (Visible to all members of this family network)</option>
                  <option value="unlisted">Unlisted (Anyone with the direct secret link can view)</option>
                  <option value="public">Public (Indexed and searchable on the public memorial directory)</option>
                </select>
              </div>

              <div className="border-t border-navy/5 pt-4 grid gap-4">
                <h4 className="text-sm font-black uppercase tracking-widest text-seafoam">External Genealogy Links</h4>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="grid gap-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-navy/50">Ancestry URL</label>
                    <input
                      className="rounded-xl border border-navy/10 px-3 py-2 text-xs focus:border-navy focus:outline-none text-navy font-medium"
                      type="url"
                      placeholder="https://ancestry.com/..."
                      value={ancestryUrl}
                      onChange={(e) => setAncestryUrl(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-navy/50">FamilySearch URL</label>
                    <input
                      className="rounded-xl border border-navy/10 px-3 py-2 text-xs focus:border-navy focus:outline-none text-navy font-medium"
                      type="url"
                      placeholder="https://familysearch.org/..."
                      value={familysearchUrl}
                      onChange={(e) => setFamilysearchUrl(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-navy/50">MyHeritage URL</label>
                    <input
                      className="rounded-xl border border-navy/10 px-3 py-2 text-xs focus:border-navy focus:outline-none text-navy font-medium"
                      type="url"
                      placeholder="https://myheritage.com/..."
                      value={myheritageUrl}
                      onChange={(e) => setMyheritageUrl(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full border border-navy/15 px-6 py-3 font-black text-navy hover:bg-cream transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-navy px-8 py-3 font-black text-white hover:bg-navy/90 transition-colors disabled:opacity-50"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
