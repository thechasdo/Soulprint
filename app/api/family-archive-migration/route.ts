import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

type MigrationQuoteRequest = {
  fullName?: string;
  email?: string;
  currentPlan?: string;
  approximateFileCount?: string;
  estimatedArchiveSize?: string;
  fileTypes?: string[];
  currentStorageLocation?: string;
  organizationHelpNeeded?: boolean | null;
  migrationLevel?: string;
  notes?: string;
};

const allowedPlans = new Set([
  'Memory Seed',
  'Family Legacy',
  'Forever Archive',
  'Not a customer yet',
  'Not sure',
]);

const allowedFileCounts = new Set([
  'Under 500',
  '500-2,000',
  '2,000-5,000',
  '5,000+',
  'Not sure',
]);

const allowedArchiveSizes = new Set([
  'Under 5 GB',
  '5-25 GB',
  '25-100 GB',
  '100+ GB',
  'Not sure',
]);

const allowedMigrationLevels = new Set([
  'upload_only',
  'full_migration',
  'not_sure',
]);

const allowedFileTypes = new Set([
  'Photos',
  'Videos',
  'Audio',
  'Documents',
  'Letters',
  'Other',
]);

function cleanText(value: unknown, maxLength = 500): string | null {
  if (typeof value !== 'string') return null;
  const cleaned = value.trim().replace(/\s+/g, ' ');
  if (!cleaned) return null;
  return cleaned.slice(0, maxLength);
}

function cleanEmail(value: unknown): string | null {
  const email = cleanText(value, 180)?.toLowerCase();
  if (!email) return null;

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email) ? email : null;
}

function cleanSelect(value: unknown, allowed: Set<string>, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  return allowed.has(value) ? value : fallback;
}

function cleanFileTypes(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter((item) => allowedFileTypes.has(item))
    .slice(0, 8);
}

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return NextResponse.json(
      {
        ok: false,
        error:
          'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY on the server.',
      },
      { status: 500 },
    );
  }

  let body: MigrationQuoteRequest;

  try {
    body = (await request.json()) as MigrationQuoteRequest;
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid request body.' },
      { status: 400 },
    );
  }

  const fullName = cleanText(body.fullName, 120);
  const email = cleanEmail(body.email);

  if (!fullName || !email) {
    return NextResponse.json(
      { ok: false, error: 'Full name and a valid email address are required.' },
      { status: 400 },
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const payload = {
    full_name: fullName,
    email,
    current_plan: cleanSelect(body.currentPlan, allowedPlans, 'Not sure'),
    approximate_file_count: cleanSelect(
      body.approximateFileCount,
      allowedFileCounts,
      'Not sure',
    ),
    estimated_archive_size: cleanSelect(
      body.estimatedArchiveSize,
      allowedArchiveSizes,
      'Not sure',
    ),
    file_types: cleanFileTypes(body.fileTypes),
    current_storage_location: cleanText(body.currentStorageLocation, 240),
    organization_help_needed:
      typeof body.organizationHelpNeeded === 'boolean'
        ? body.organizationHelpNeeded
        : null,
    migration_level: cleanSelect(
      body.migrationLevel,
      allowedMigrationLevels,
      'not_sure',
    ),
    notes: cleanText(body.notes, 1500),
    quote_status: 'new',
  };

  const { error } = await supabase
    .from('family_archive_migration_requests')
    .insert(payload);

  if (error) {
    console.error('Family Archive Migration request insert failed:', error);

    return NextResponse.json(
      {
        ok: false,
        error:
          'We could not submit this request. Please try again or contact support.',
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
