"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { SoulprintLogo } from "@/components/SoulprintLogo";
import { Upload, FileText, Image, Film, Music, ShieldCheck, Plus, Trash2, Download } from "lucide-react";
import { LegacyKeyManager } from "@/components/LegacyKeyManager";

interface Asset {
  id: string;
  profile_id: string;
  asset_type: "photo" | "voice" | "video" | "document" | "other";
  storage_path: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
  profile_name?: string;
}

interface Profile {
  id: string;
  full_name: string;
}

export default function VaultPage() {
  const supabase = createClient();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states for upload
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [selectedType, setSelectedType] = useState<Asset["asset_type"]>("photo");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch profiles first to let user choose who the upload belongs to
      const { data: profileData, error: profileError } = await supabase
        .from("soulprint_profiles")
        .select("id, full_name")
        .order("full_name");

      if (profileError) throw profileError;
      setProfiles(profileData || []);
      if (profileData && profileData.length > 0) {
        setSelectedProfileId(profileData[0].id);
      }

      // Fetch existing assets
      const { data: assetData, error: assetError } = await supabase
        .from("soulprint_assets")
        .select("*")
        .order("created_at", { ascending: false });

      if (assetError) throw assetError;

      // Map profile names to assets
      const mappedAssets = (assetData || []).map((asset: any) => {
        const profile = (profileData || []).find((p: any) => p.id === asset.profile_id);
        return {
          ...asset,
          profile_name: profile ? profile.full_name : "Unknown Profile",
        };
      });

      setAssets(mappedAssets);
    } catch (err: any) {
      console.error("Error fetching vault data:", err);
      setError(err.message || "Failed to load vault assets.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!selectedProfileId) {
      setError("Please select or create a profile first.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // 1. Get signed upload URL from our Next API route
      const response = await fetch("/api/uploads/signed-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          profileId: selectedProfileId,
          tier: "free", // Default to free for trial
        }),
      });

      const uploadConfig = await response.json();
      if (!response.ok) {
        throw new Error(uploadConfig.error || "Failed to generate signed upload URL.");
      }

      // 2. Perform direct upload to Supabase Storage using the signed URL
      const uploadResponse = await fetch(uploadConfig.signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file to storage.");
      }

      // 3. Register the asset in the soulprint_assets database table
      const { error: dbError } = await supabase
        .from("soulprint_assets")
        .insert({
          profile_id: selectedProfileId,
          asset_type: selectedType,
          storage_path: uploadConfig.path,
          file_name: file.name,
          mime_type: file.type,
          size_bytes: file.size,
        });

      if (dbError) throw dbError;

      // Refresh list
      fetchData();
    } catch (err: any) {
      setError(err.message || "An error occurred during upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAsset = async (asset: Asset) => {
    if (!confirm(`Are you sure you want to permanently delete "${asset.file_name}"?`)) return;

    try {
      // 1. Delete from Supabase Storage
      const { error: storageError } = await supabase.storage
        .from("memory-assets")
        .remove([asset.storage_path]);

      if (storageError) console.error("Error removing from storage:", storageError);

      // 2. Delete from database
      const { error: dbError } = await supabase
        .from("soulprint_assets")
        .delete()
        .eq("id", asset.id);

      if (dbError) throw dbError;

      fetchData();
    } catch (err: any) {
      alert(err.message || "An error occurred while deleting asset.");
    }
  };

  const getAssetIcon = (type: Asset["asset_type"]) => {
    switch (type) {
      case "photo": return <Image className="h-6 w-6 text-seafoam" />;
      case "video": return <Film className="h-6 w-6 text-sunset" />;
      case "voice": return <Music className="h-6 w-6 text-navy" />;
      case "document": return <FileText className="h-6 w-6 text-navy/70" />;
      default: return <Upload className="h-6 w-6 text-navy/50" />;
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  return (
    <main className="mx-auto max-w-5xl px-5 py-12">
      <SoulprintLogo size="sm" />
      <h1 className="mt-8 text-4xl font-black text-navy">Estate Vault</h1>
      <p className="mt-3 max-w-2xl leading-8 text-navy/70">
        Safely store high-definition family memories, audio journals, home videos, and important documents. Your vault is secured with industry-standard AES-256 encryption.
      </p>

      {/* Upload Panel */}
      <div className="mt-8 brand-card rounded-brand p-8">
        <h3 className="text-xl font-black text-navy flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-seafoam" /> Secure Upload Portal
        </h3>
        
        {error && (
          <div className="mt-4 rounded-2xl bg-sunset/10 p-4 text-sm font-bold text-sunset">
            {error}
          </div>
        )}

        {profiles.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-cream p-6 text-center text-navy/70 font-bold">
            Please create a <a href="/dashboard/profiles" className="underline text-navy">Profile</a> first before uploading assets.
          </div>
        ) : (
          <div className="mt-6 grid gap-6 md:grid-cols-3 items-end">
            <div className="grid gap-2">
              <label className="text-xs font-black uppercase tracking-wider text-navy/60">Belongs to Profile</label>
              <select
                className="rounded-2xl border border-navy/10 px-4 py-3 focus:border-navy focus:outline-none text-navy font-bold"
                value={selectedProfileId}
                onChange={(e) => setSelectedProfileId(e.target.value)}
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>{p.full_name}</option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-xs font-black uppercase tracking-wider text-navy/60">Asset Category</label>
              <select
                className="rounded-2xl border border-navy/10 px-4 py-3 focus:border-navy focus:outline-none text-navy font-bold"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as Asset["asset_type"])}
              >
                <option value="photo">Photo / Scan</option>
                <option value="voice">Voice Note / Audio</option>
                <option value="video">Home Video</option>
                <option value="document">Legal / Will / Document</option>
                <option value="other">Other Artifact</option>
              </select>
            </div>

            <div className="relative">
              <input
                type="file"
                id="vault-file-upload"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              <label
                htmlFor="vault-file-upload"
                className={`flex justify-center items-center gap-2 rounded-full bg-navy px-6 py-3.5 text-sm font-black text-white hover:bg-navy/90 transition-colors shadow-glow cursor-pointer ${uploading ? "opacity-50 pointer-events-none" : ""}`}
              >
                <Upload className="h-4 w-4" /> {uploading ? "Uploading Securely..." : "Upload New File"}
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Legacy Key Executor Protocol Section */}
      <div className="mt-16 border-t border-navy/10 pt-16">
        <div className="mb-10">
          <p className="text-xs font-black uppercase tracking-widest text-seafoam">Estate Continuity</p>
          <h2 className="mt-2 text-3xl font-black text-navy">Legacy Key Transfer Protocol</h2>
          <p className="mt-2 max-w-2xl leading-7 text-navy/70">
            Generate secure, offline credentials to pass onto your legal executor. This ensures your family maintains uninterrupted access to historical records and private memorials.
          </p>
        </div>
        <LegacyKeyManager />
      </div>

      {/* Asset List */}
      <div className="mt-16 border-t border-navy/10 pt-16">
        <h3 className="text-2xl font-black text-navy">Stored Assets ({assets.length})</h3>
        
        {loading ? (
          <div className="mt-8 text-center text-navy/60 font-bold">Loading assets...</div>
        ) : assets.length === 0 ? (
          <div className="mt-6 rounded-brand border border-dashed border-navy/20 bg-white p-12 text-center text-navy/60">
            No assets stored in the secure vault yet. Use the upload portal above to save your first memory.
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-brand border border-navy/10 bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cream border-b border-navy/10">
                  <th className="p-4 text-xs font-black uppercase tracking-wider text-navy/60">Type</th>
                  <th className="p-4 text-xs font-black uppercase tracking-wider text-navy/60">File Name</th>
                  <th className="p-4 text-xs font-black uppercase tracking-wider text-navy/60">Profile</th>
                  <th className="p-4 text-xs font-black uppercase tracking-wider text-navy/60">Size</th>
                  <th className="p-4 text-xs font-black uppercase tracking-wider text-navy/60">Uploaded</th>
                  <th className="p-4 text-xs font-black uppercase tracking-wider text-navy/60 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy/5">
                {assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-cream/30 transition-colors">
                    <td className="p-4">{getAssetIcon(asset.asset_type)}</td>
                    <td className="p-4 font-bold text-navy max-w-xs truncate">{asset.file_name}</td>
                    <td className="p-4 font-medium text-navy/70">{asset.profile_name}</td>
                    <td className="p-4 text-sm text-navy/60">{formatBytes(asset.size_bytes)}</td>
                    <td className="p-4 text-sm text-navy/60">{new Date(asset.created_at).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={async () => {
                            // Get signed download URL
                            const { data, error } = await supabase.storage
                              .from("memory-assets")
                              .createSignedUrl(asset.storage_path, 60);

                            if (error) {
                              alert("Error generating download link: " + error.message);
                            } else if (data?.signedUrl) {
                              window.open(data.signedUrl, "_blank");
                            }
                          }}
                          className="p-2 rounded-full hover:bg-cream text-navy/70 hover:text-navy transition-colors"
                          title="Download File"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAsset(asset)}
                          className="p-2 rounded-full hover:bg-sunset/10 text-sunset/70 hover:text-sunset transition-colors"
                          title="Delete File"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
