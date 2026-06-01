import Link from "next/link";
import { SoulprintLogo } from "@/components/SoulprintLogo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-5 text-center">
      <div className="mb-8">
        <SoulprintLogo size="lg" showText={false} href={undefined} />
      </div>
      <p className="rounded-full bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.22em] text-seafoam shadow-glow">
        404 • Page Not Found
      </p>
      <h1 className="mt-6 text-4xl font-black tracking-tight text-navy md:text-5xl">
        This memory hasn’t been written yet.
      </h1>
      <p className="mt-4 max-w-md text-navy/70 leading-7">
        The page you are looking for doesn’t exist or has been moved to a different part of the archive.
      </p>
      <div className="mt-8">
        <Link
          href="/"
          className="rounded-full bg-navy px-8 py-4 font-black text-white shadow-glow transition hover:-translate-y-0.5"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
