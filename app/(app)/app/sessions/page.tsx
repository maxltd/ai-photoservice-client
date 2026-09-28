import { cookies } from "next/headers";
import {
  API_ROUTES,
  type CategoryResponse,
  type PhotoSessionListItemResponse,
} from "@/lib/api/contract";
import { toServerApiUrl } from "@/lib/api/server";
import { SessionsCatalogClient } from "@/components/sessions/SessionsCatalogClient";

interface ApiListResponse<TData> {
  data: TData;
}

type SessionWithPhotosCount = PhotoSessionListItemResponse & {
  photosCount: number;
  slotPreviewUrls: string[];
};

interface PhotoSessionSlotForCard {
  order: number;
  previewUrl: string | null;
}

interface PhotoSessionDetailForCount {
  slots?: PhotoSessionSlotForCard[];
}

export default async function SessionsPage() {
  const cookieStore = await cookies();
  const cookie = cookieStore.toString();

  const [catsRes, sessionsRes] = await Promise.all([
    fetch(toServerApiUrl(`${API_ROUTES.CATEGORIES}?pageSize=100`), {
      headers: { cookie },
      cache: "no-store",
    }),
    fetch(toServerApiUrl(API_ROUTES.PHOTO_SESSIONS), {
      headers: { cookie },
      cache: "no-store",
    }),
  ]);

  const catsJson = (await catsRes.json()) as ApiListResponse<
    CategoryResponse[]
  >;
  const sessionsJson = (await sessionsRes.json()) as ApiListResponse<
    PhotoSessionListItemResponse[]
  >;

  const sessionsWithPhotosCount: SessionWithPhotosCount[] = await Promise.all(
    sessionsJson.data.map(async (session) => {
      try {
        const detailRes = await fetch(
          toServerApiUrl(API_ROUTES.PHOTO_SESSION_BY_SLUG(session.slug)),
          {
            headers: { cookie },
            cache: "no-store",
          },
        );

        if (!detailRes.ok) {
          return {
            ...session,
            photosCount: 0,
            slotPreviewUrls: [],
          };
        }

        const detailJson =
          (await detailRes.json()) as ApiListResponse<PhotoSessionDetailForCount>;

        const slots = Array.isArray(detailJson.data?.slots)
          ? detailJson.data.slots
          : [];

        const slotPreviewUrls = [...slots]
          .sort((a, b) => a.order - b.order)
          .map((slot) => slot.previewUrl)
          .filter(
            (url): url is string => typeof url === "string" && url.length > 0,
          )
          .slice(0, 4);

        return {
          ...session,
          photosCount: slots.length,
          slotPreviewUrls,
        };
      } catch {
        return {
          ...session,
          photosCount: 0,
          slotPreviewUrls: [],
        };
      }
    }),
  );

  return (
    <SessionsCatalogClient
      categories={catsJson.data}
      sessions={sessionsWithPhotosCount}
    />
  );
}
