export const AI_PROFILE_KEY = "ai_profile_photos";

export interface AiProfilePhoto {
  localId: string;
  storageKey: string;
  uploadedAt: string;
}

function isAiProfilePhoto(value: unknown): value is AiProfilePhoto {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    typeof item.localId === "string" &&
    typeof item.storageKey === "string" &&
    typeof item.uploadedAt === "string"
  );
}

export function readAiProfilePhotos(): AiProfilePhoto[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(AI_PROFILE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    const uniqueByStorageKey = new Set<string>();

    return parsed
      .filter(isAiProfilePhoto)
      .filter((photo) => {
        if (uniqueByStorageKey.has(photo.storageKey)) {
          return false;
        }

        uniqueByStorageKey.add(photo.storageKey);
        return true;
      })
      .slice(0, 15);
  } catch {
    return [];
  }
}

export function writeAiProfilePhotos(photos: AiProfilePhoto[]): void {
  if (typeof window === "undefined") {
    return;
  }

  const normalized = photos.slice(0, 15).map((photo) => ({
    localId: photo.localId,
    storageKey: photo.storageKey,
    uploadedAt: photo.uploadedAt,
  }));

  window.localStorage.setItem(AI_PROFILE_KEY, JSON.stringify(normalized));
}
