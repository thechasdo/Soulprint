import Link from 'next/link';

export default function FamilyArchiveMigrationCard() {
  return (
    <article className="rounded-3xl border border-teal-200/40 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
            One-time service
          </p>
          <h3 className="mt-3 text-2xl font-bold text-slate-950">
            Family Archive Migration
          </h3>
          <p className="mt-2 text-xl font-semibold text-teal-700">Starting at $149</p>
        </div>

        <p className="leading-7 text-slate-600">
          Need help moving existing family photos, videos, audio, documents, or
          memory files into Soulprint? Request a quote and we’ll review the archive
          size, file volume, source location, and migration complexity.
        </p>

        <p className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
          Final pricing ranges from $149-$299. This service is quote-based and is
          not a direct checkout add-on.
        </p>

        <Link
          href="/request-migration-quote"
          className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Request Migration Quote
        </Link>
      </div>
    </article>
  );
}
