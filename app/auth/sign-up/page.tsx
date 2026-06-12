"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SoulprintLogo } from "@/components/SoulprintLogo";

export default function SignUpPage() {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: name,
          },
        },
      });

      if (signUpError) throw signUpError;

      // Automatically create a user profile row in public.user_profiles
      if (data.user) {
        const { error: profileError } = await supabase
          .from("user_profiles")
          .upsert({
            id: data.user.id,
            display_name: name,
          });

        if (profileError) console.error("Error creating user profile:", profileError);
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "An error occurred during sign up.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <section className="brand-card w-full max-w-md rounded-[2rem] p-8">
        <SoulprintLogo size="sm" />
        <h1 className="mt-8 text-3xl font-black text-navy">Create your first Soulprint</h1>
        <p className="mt-2 text-navy/65">Start free. Preserve one profile and invite family when ready.</p>

        {success ? (
          <div className="mt-8 rounded-2xl bg-seafoam/10 p-6 text-center">
            <h3 className="text-xl font-black text-navy">Check your email</h3>
            <p className="mt-2 text-sm leading-6 text-navy/75">
              We&apos;ve sent a confirmation link to <span className="font-bold">{email}</span>. Please click the link to activate your account.
            </p>
            <a
              href="/auth/sign-in"
              className="mt-6 inline-block rounded-full bg-navy px-6 py-3 text-sm font-black text-white hover:bg-navy/90 transition-colors"
            >
              Go to Sign In
            </a>
          </div>
        ) : (
          <form onSubmit={handleSignUp} className="mt-8 grid gap-4">
            {error && (
              <div className="rounded-2xl bg-sunset/10 p-4 text-sm font-bold text-sunset">
                {error}
              </div>
            )}
            <input
              className="rounded-2xl border border-navy/10 px-4 py-4 focus:border-navy focus:outline-none"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
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
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        )}

        {!success && (
          <p className="mt-6 text-center text-sm text-navy/60">
            Already have an account?{" "}
            <a href="/auth/sign-in" className="font-bold text-navy hover:underline">
              Sign in
            </a>
          </p>
        )}
      </section>
    </main>
  );
}
