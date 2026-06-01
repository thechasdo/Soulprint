"use client";

import { useEffect } from "react";
import Link from "next/link";
import { SoulprintLogo } from "@/components/SoulprintLogo";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-5 text-center">
      <div className="mb-8">
        <SoulprintLogo size="lg" showText={false} href={undefined} />
      </div>
      <p className="rounded-full bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.22em] text-sunset shadow-glow">
        500 • Server Error
      </p>
      <h1 className="mt-6 text-4xl font-black tracking-tight text-navy md:text-5xl">
        Something went wrong.
      </h1>
      <p className="mt-4 max-w-md text-navy/70 leading-7">
        An error occurred while loading the archive. Our secure vault systems are safe, but the connection was interrupted.
      </p>
      <div className="mt-8 flex gap-4">
        <button
          onClick={() => reset()}
          className="rounded-full bg-navy px-8 py-4 font-black text-white shadow-glow transition hover:-translate-y-0.5"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="rounded-full border border-navy/15 bg-white px-8 py-4 font-black text-navy transition hover:-translate-y-0.5"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
