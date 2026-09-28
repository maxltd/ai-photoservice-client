import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  API_ROUTES,
  type CategoryResponse,
  type PaginatedResponse,
  type PhotoSessionListItemResponse,
  type PhotoSessionResponse,
} from "@/lib/api/contract";
import { PhotoSessionsClient } from "@/components/admin/sessions/PhotoSessionsClient";
import type { PhotoSessionListWithStats } from "@/lib/hooks/sessions/usePhotoSessions";

export const dynamic = "force-dynamic";

async function getInitialData(): Promise<{
  sessions: PhotoSessionListWithStats[];
  categories: CategoryResponse[];
}> {
  const cookieStore = await cookies();
  const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("API_URL is not set");
  }

  const [sessionsRes, categoriesRes] = await Promise.all([
    fetch(`${apiUrl}${API_ROUTES.ADMIN_PHOTO_SESSIONS}?pageSize=100`, {
      headers: { cookie: cookieStore.toString() },
      cache: "no-store",
    }),
    fetch(`${apiUrl}${API_ROUTES.ADMIN_CATEGORIES}?pageSize=100`, {
      headers: { cookie: cookieStore.toString() },
      cache: "no-store",
    }),
  ]);

  if (sessionsRes.status === 401 || categoriesRes.status === 401) {
    redirect("/?auth=1");
  }

  if (sessionsRes.status === 403 || categoriesRes.status === 403) {
    redirect("/403");
  }

  if (!sessionsRes.ok) {
    throw new Error("Failed to load photo sessions");
  }

  if (!categoriesRes.ok) {
    throw new Error("Failed to load categories for sessions");
  }

  const sessionsPayload =
    (await sessionsRes.json()) as PaginatedResponse<PhotoSessionListItemResponse>;

  const categoriesPayload =
    (await categoriesRes.json()) as PaginatedResponse<CategoryResponse>;

  const sessions = sessionsPayload.data;

  const details = await Promise.all(
    sessions.map(async (session) => {
      const detailRes = await fetch(
        `${apiUrl}${API_ROUTES.ADMIN_PHOTO_SESSION_BY_ID(session.id)}`,
        {
          headers: { cookie: cookieStore.toString() },
          cache: "no-store",
        },
      );

      if (!detailRes.ok) {
        return { id: session.id, slotsCount: 0 };
      }

      const detailPayload = (await detailRes.json()) as
        | PhotoSessionResponse
        | { data: PhotoSessionResponse };

      const detail =
        "data" in detailPayload ? detailPayload.data : detailPayload;

      return {
        id: session.id,
        slotsCount: detail.slots.length,
      };
    }),
  );

  const slotsCountMap = new Map(
    details.map((item) => [item.id, item.slotsCount]),
  );

  return {
    sessions: sessions.map((session) => ({
      ...session,
      slotsCount: slotsCountMap.get(session.id) ?? 0,
    })),
    categories: categoriesPayload.data,
  };
}

export default async function SessionsPage() {
  const { sessions, categories } = await getInitialData();
  return <PhotoSessionsClient initialData={sessions} categories={categories} />;
}
