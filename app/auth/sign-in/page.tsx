"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SoulprintLogo } from "@/components/SoulprintLogo";

export default function SignInPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred during sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <section className="brand-card w-full max-w-md rounded-[2rem] p-8">
        <SoulprintLogo size="sm" />
        <h1 className="mt-8 text-3xl font-black text-navy">Welcome back</h1>
        <p className="mt-2 text-navy/65">Sign in to continue building your family archive.</p>

        <form onSubmit={handleSignIn} className="mt-8 grid gap-4">
          {error && (
            <div className="rounded-2xl bg-sunset/10 p-4 text-sm font-bold text-sunset">
              {error}
            </div>
          )}
          <input
            className="rounded-2xl border border-navy/10 px-4 py-4 focus:border-navy focus:outline-none"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <input
            className="rounded-2xl border border-navy/10 px-4 py-4 focus:border-navy focus:outline-none"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <button
            type="submit"
            className="rounded-full bg-navy px-5 py-4 font-black text-white hover:bg-navy/90 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-navy/60">
          Don't have an account?{" "}
          <a href="/auth/sign-up" className="font-bold text-navy hover:underline">
            Sign up
          </a>
        </p>
      </section>
    </main>
  );
}
