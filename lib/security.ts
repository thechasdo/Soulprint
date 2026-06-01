export const allowedUploadTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "audio/mpeg",
  "audio/mp4",
  "application/pdf",
  "text/plain"
];

export const tierLimits = {
  free: {
    maxFileSizeMb: 25,
    storageGb: 1,
    profiles: 1
  },
  family_legacy: {
    maxFileSizeMb: 250,
    storageGb: 25,
    profiles: 5
  },
  forever_archive: {
    maxFileSizeMb: 1024,
    storageGb: 100,
    profiles: 25
  }
};

export function assertSafeFile(mimeType: string, sizeBytes: number, tier: keyof typeof tierLimits) {
  if (!allowedUploadTypes.includes(mimeType)) {
    throw new Error("This file type is not allowed.");
  }

  const maxBytes = tierLimits[tier].maxFileSizeMb * 1024 * 1024;
  if (sizeBytes > maxBytes) {
    throw new Error(`This file exceeds the ${tierLimits[tier].maxFileSizeMb} MB limit for your plan.`);
  }
}
