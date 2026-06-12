'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';

const fileTypeOptions = ['Photos', 'Videos', 'Audio', 'Documents', 'Letters', 'Other'];

const initialForm = {
  fullName: '',
  email: '',
  currentPlan: 'Not sure',
  approximateFileCount: 'Not sure',
  estimatedArchiveSize: 'Not sure',
  fileTypes: [] as string[],
  currentStorageLocation: '',
  organizationHelpNeeded: null as boolean | null,
  migrationLevel: 'not_sure',
  notes: '',
};

export default function RequestMigrationQuotePage() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>(
    'idle',
  );
  const [errorMessage, setErrorMessage] = useState('');

  const canSubmit = useMemo(() => {
    return Boolean(form.fullName.trim() && form.email.trim() && status !== 'submitting');
  }, [form.email, form.fullName, status]);

  function toggleFileType(fileType: string) {
    setForm((current) => {
      const exists = current.fileTypes.includes(fileType);
      return {
        ...current,
        fileTypes: exists
          ? current.fileTypes.filter((item) => item !== fileType)
          : [...current.fileTypes, fileType],
      };
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch('/api/family-archive-migration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const result = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Unable to submit request.');
      }

      setStatus('success');
      setForm(initialForm);
    } catch (error) {
      setStatus('error');
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.',
      );
    }
  }

  if (status === 'success') {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
        <section className="mx-auto max-w-3xl rounded-3xl border border-teal-300/20 bg-white/10 p-8 shadow-2xl backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-200">
            Request received
          </p>
          <h1 className="mt-4 text-3xl font-bold md:text-5xl">
            Thank you. Your Family Archive Migration request has been received.
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-200">
            We’ll review your archive size and migration needs, then send a custom
            Stripe quote or invoice for the correct one-time migration price.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setStatus('idle')}
              className="rounded-full bg-teal-300 px-6 py-3 font-semibold text-slate-950 transition hover:bg-teal-200"
            >
              Submit another request
            </button>
            <Link
              href="/"
              className="rounded-full border border-white/20 px-6 py-3 text-center font-semibold text-white transition hover:bg-white/10"
            >
              Return home
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-5xl">
        <Link href="/" className="text-sm font-semibold text-teal-200 hover:text-teal-100">
          ← Back to Soulprint
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <aside className="rounded-3xl border border-teal-300/20 bg-white/10 p-8 shadow-2xl backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-200">
              One-time service
            </p>
            <h1 className="mt-4 text-4xl font-bold md:text-5xl">
              Family Archive Migration
            </h1>
            <p className="mt-5 text-2xl font-semibold text-teal-100">
              Starting at $149
            </p>
            <p className="mt-5 leading-8 text-slate-200">
              Need help moving your existing family photos, videos, audio,
              documents, or memory files into Soulprint? This request helps us
              review your archive and send the right Stripe quote or invoice.
            </p>
            <div className="mt-8 rounded-2xl border border-white/10 bg-slate-900/70 p-5">
              <h2 className="font-semibold text-white">Pricing range</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Final pricing ranges from $149-$299 based on archive size, file
                volume, source location, and migration complexity.
              </p>
            </div>
          </aside>

          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-white/10 bg-white p-6 text-slate-950 shadow-2xl md:p-8"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold">Full name *</span>
                <input
                  value={form.fullName}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, fullName: event.target.value }))
                  }
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500"
                  placeholder="Jane Doe"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold">Email address *</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, email: event.target.value }))
                  }
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500"
                  placeholder="name@example.com"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold">Current Soulprint plan</span>
                <select
                  value={form.currentPlan}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, currentPlan: event.target.value }))
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500"
                >
                  <option>Memory Seed</option>
                  <option>Family Legacy</option>
                  <option>Forever Archive</option>
                  <option>Not a customer yet</option>
                  <option>Not sure</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold">Approximate number of files</span>
                <select
                  value={form.approximateFileCount}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      approximateFileCount: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500"
                >
                  <option>Under 500</option>
                  <option>500-2,000</option>
                  <option>2,000-5,000</option>
                  <option>5,000+</option>
                  <option>Not sure</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold">Estimated archive size</span>
                <select
                  value={form.estimatedArchiveSize}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      estimatedArchiveSize: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500"
                >
                  <option>Under 5 GB</option>
                  <option>5-25 GB</option>
                  <option>25-100 GB</option>
                  <option>100+ GB</option>
                  <option>Not sure</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold">Where are the files now?</span>
                <input
                  value={form.currentStorageLocation}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      currentStorageLocation: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500"
                  placeholder="Phone, computer, Google Drive, Dropbox, external drive..."
                />
              </label>
            </div>

            <fieldset className="mt-6">
              <legend className="text-sm font-semibold">File types</legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {fileTypeOptions.map((fileType) => (
                  <label
                    key={fileType}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3"
                  >
                    <input
                      type="checkbox"
                      checked={form.fileTypes.includes(fileType)}
                      onChange={() => toggleFileType(fileType)}
                      className="h-4 w-4"
                    />
                    <span>{fileType}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-6">
              <legend className="text-sm font-semibold">Do you need organization help?</legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
                  <input
                    type="radio"
                    name="organizationHelpNeeded"
                    checked={form.organizationHelpNeeded === true}
                    onChange={() =>
                      setForm((current) => ({ ...current, organizationHelpNeeded: true }))
                    }
                  />
                  <span>Yes</span>
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
                  <input
                    type="radio"
                    name="organizationHelpNeeded"
                    checked={form.organizationHelpNeeded === false}
                    onChange={() =>
                      setForm((current) => ({ ...current, organizationHelpNeeded: false }))
                    }
                  />
                  <span>No</span>
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
                  <input
                    type="radio"
                    name="organizationHelpNeeded"
                    checked={form.organizationHelpNeeded === null}
                    onChange={() =>
                      setForm((current) => ({ ...current, organizationHelpNeeded: null }))
                    }
                  />
                  <span>Not sure</span>
                </label>
              </div>
            </fieldset>

            <label className="mt-6 block">
              <span className="text-sm font-semibold">What level of help do you need?</span>
              <select
                value={form.migrationLevel}
                onChange={(event) =>
                  setForm((current) => ({ ...current, migrationLevel: event.target.value }))
                }
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500"
              >
                <option value="upload_only">Upload/import help only</option>
                <option value="full_migration">Full migration, cleanup, and organization</option>
                <option value="not_sure">Not sure yet</option>
              </select>
            </label>

            <label className="mt-6 block">
              <span className="text-sm font-semibold">Notes</span>
              <textarea
                value={form.notes}
                onChange={(event) =>
                  setForm((current) => ({ ...current, notes: event.target.value }))
                }
                rows={5}
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500"
                placeholder="Tell us anything else we should know about the archive."
              />
            </label>

            {status === 'error' ? (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-8 w-full rounded-full bg-slate-950 px-6 py-4 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === 'submitting' ? 'Submitting request...' : 'Request Migration Quote'}
            </button>

            <p className="mt-4 text-center text-xs leading-5 text-slate-500">
              This is not an automatic checkout. Soulprint will review your request and send
              the correct Stripe quote or invoice for the one-time migration service.
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
