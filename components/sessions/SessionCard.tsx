import Image from "next/image";
import Link from "next/link";
import { Camera } from "lucide-react";
import type { PhotoSessionListItemResponse } from "@/lib/api/contract";

type SessionWithPhotos = PhotoSessionListItemResponse & {
  slotsCount?: number;
  slotCount?: number;
  photosCount?: number;
  slotPreviewUrls?: string[];
  slots?: unknown;
};

interface SessionCardProps {
  session: PhotoSessionListItemResponse;
  onOpen?: (session: PhotoSessionListItemResponse) => void;
}

function FilledTicketIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3 w-3 text-[--color-token]"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M4 7.25A2.25 2.25 0 0 1 6.25 5h11.5A2.25 2.25 0 0 1 20 7.25v2.2a1.8 1.8 0 1 0 0 3.6v2.2a2.25 2.25 0 0 1-2.25 2.25H6.25A2.25 2.25 0 0 1 4 15.25v-2.2a1.8 1.8 0 0 0 0-3.6v-2.2Z"
      />
      <path
        d="M12 7.5v9"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="1.25 1.6"
        strokeLinecap="round"
        opacity="0.45"
      />
    </svg>
  );
}

function getPhotosCount(session: PhotoSessionListItemResponse): number | null {
  const candidate = session as SessionWithPhotos;

  if (typeof candidate.photosCount === "number") {
    return candidate.photosCount;
  }

  if (typeof candidate.slotsCount === "number") {
    return candidate.slotsCount;
  }

  if (typeof candidate.slotCount === "number") {
    return candidate.slotCount;
  }

  if (Array.isArray(candidate.slots)) {
    return candidate.slots.length;
  }

  return null;
}

function getSlotPreviewUrls(session: PhotoSessionListItemResponse): string[] {
  const candidate = session as SessionWithPhotos;

  if (!Array.isArray(candidate.slotPreviewUrls)) {
    return [];
  }

  return candidate.slotPreviewUrls.filter(
    (url): url is string => typeof url === "string" && url.length > 0,
  );
}

export function SessionCard({ session, onOpen }: SessionCardProps) {
  const photosCount = getPhotosCount(session);
  const slotPreviewUrls = getSlotPreviewUrls(session);
  const hasSlotPreviewGrid = slotPreviewUrls.length > 0;

  const cardClassName =
    "group relative block h-[232px] w-[164px] shrink-0 overflow-hidden rounded-[12px] border border-white/12 bg-[--color-surface] md:h-[306px] md:w-[204px]";

  const content = (
    <>
      {hasSlotPreviewGrid ? (
        <div className="grid h-full w-full grid-cols-2 grid-rows-2">
          {Array.from({ length: 4 }).map((_, index) => {
            const slotPreviewUrl = slotPreviewUrls[index] ?? null;

            return (
              <div
                key={index}
                className="relative h-full w-full overflow-hidden"
              >
                {slotPreviewUrl ? (
                  <Image
                    src={slotPreviewUrl}
                    alt={session.title}
                    fill
                    unoptimized
                    className="object-cover transition duration-300 group-hover:scale-[1.03]"
                    sizes="(max-width: 767px) 82px, 102px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-black/25 text-[--color-foreground-muted]">
                    <Camera className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : session.previewUrl ? (
        <Image
          src={session.previewUrl}
          alt={session.title}
          fill
          unoptimized
          className="object-cover transition duration-300 group-hover:scale-[1.03]"
          sizes="(max-width: 767px) 164px, 204px"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[--color-foreground-muted]">
          <Camera className="h-5 w-5" />
        </div>
      )}

      <span className="absolute left-1/2 top-3 inline-flex -translate-x-1/2 items-center gap-1 rounded-md bg-black/80 px-1.5 py-[3px] text-[11px] font-normal leading-[116%] text-white backdrop-blur-sm">
        <FilledTicketIcon />
        {session.tokenCostPerSlot}
      </span>

      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />
      <div className="absolute inset-x-3 bottom-3 flex flex-col items-center gap-1.5 text-center md:bottom-4 md:inset-x-4">
        {photosCount !== null ? (
          <span className="inline-flex items-center rounded-full bg-black/15 px-2 py-[3px] text-[11px] font-normal leading-[116%] text-white backdrop-blur-sm">
            {photosCount} фото
          </span>
        ) : null}

        <p className="line-clamp-2 text-[13px] font-normal leading-[116%] text-[--color-foreground] md:text-[15px]">
          {session.title}
        </p>
      </div>
    </>
  );

  if (onOpen) {
    return (
      <button
        type="button"
        onClick={() => onOpen(session)}
        className={cardClassName}
        aria-label={`Открыть фотосессию ${session.title}`}
      >
        {content}
      </button>
    );
  }

  return (
    <Link href={`/app/sessions/${session.slug}`} className={cardClassName}>
      {content}
    </Link>
  );
}
