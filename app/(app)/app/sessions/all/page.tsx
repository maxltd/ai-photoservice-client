import { cookies } from "next/headers";
import {
  API_ROUTES,
  type CategoryResponse,
  type PhotoSessionListItemResponse,
} from "@/lib/api/contract";
import { toServerApiUrl } from "@/lib/api/server";
import { BrowseSessionsClient } from "@/components/sessions/BrowseSessionsClient";

interface ApiListResponse<TData> {
  data: TData;
}

type SessionWithPhotosCount = PhotoSessionListItemResponse & {
  photosCount: number;
};

interface PhotoSessionDetailForCount {
  slots?: unknown[];
}

export default async function SessionsAllPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

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
          };
        }

        const detailJson =
          (await detailRes.json()) as ApiListResponse<PhotoSessionDetailForCount>;

        return {
          ...session,
          photosCount: Array.isArray(detailJson.data?.slots)
            ? detailJson.data.slots.length
            : 0,
        };
      } catch {
        return {
          ...session,
          photosCount: 0,
        };
      }
    }),
  );

  return (
    <BrowseSessionsClient
      categories={catsJson.data}
      sessions={sessionsWithPhotosCount}
      initialCategorySlug={category ?? null}
    />
  );
}
