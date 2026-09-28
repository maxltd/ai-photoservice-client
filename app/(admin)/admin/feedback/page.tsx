import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { FeedbackClient } from "@/components/admin/feedback/FeedbackClient";
import {
  API_ROUTES,
  FeedbackStatus,
  type FeedbackResponse,
  type PaginatedResponse,
} from "@/lib/api/contract";
import { requireAdmin } from "@/app/(admin)/admin/_lib/require-admin";

export const dynamic = "force-dynamic";

export default async function AdminFeedbackPage() {
  const cookieStore = await cookies();
  const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("API_URL is not set");
  }

  await requireAdmin(apiUrl, cookieStore.toString());

  const res = await fetch(
    `${apiUrl}${API_ROUTES.ADMIN_FEEDBACK}?pageSize=20&status=${FeedbackStatus.NEW}`,
    {
      headers: { cookie: cookieStore.toString() },
      cache: "no-store",
    },
  );

  if (res.status === 401) {
    redirect("/?auth=1");
  }

  if (res.status === 403) {
    redirect("/403");
  }

  if (!res.ok) {
    throw new Error("Failed to load admin feedback");
  }

  const result = (await res.json()) as PaginatedResponse<FeedbackResponse>;
  return <FeedbackClient initialData={result.data} initialMeta={result.meta} />;
}
