"use client";

import { useEffect } from "react";
import { SoulprintLogo } from "@/components/SoulprintLogo";

export default function GlobalError({
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
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-cream px-5 text-center antialiased">
        <div className="mb-8">
          <SoulprintLogo size="lg" showText={false} href={undefined} />
        </div>
        <p className="rounded-full bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.22em] text-sunset shadow-glow">
          500 • Critical Error
        </p>
        <h1 className="mt-6 text-4xl font-black tracking-tight text-navy md:text-5xl">
          A critical error occurred.
        </h1>
        <p className="mt-4 max-w-md text-navy/70 leading-7">
          Our secure vault systems are safe, but a critical system error occurred. Please try reloading the application.
        </p>
        <div className="mt-8">
          <button
            onClick={() => reset()}
            className="rounded-full bg-navy px-8 py-4 font-black text-white shadow-glow transition hover:-translate-y-0.5"
          >
            Reset Application
          </button>
        </div>
      </body>
    </html>
  );
}
