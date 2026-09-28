import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ReportsClient } from "@/components/admin/reports/ReportsClient";
import {
  API_ROUTES,
  ReportStatus,
  type PaginatedResponse,
  type ReportResponse,
} from "@/lib/api/contract";
import { requireAdmin } from "@/app/(admin)/admin/_lib/require-admin";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const cookieStore = await cookies();
  const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("API_URL is not set");
  }

  await requireAdmin(apiUrl, cookieStore.toString());

  const res = await fetch(
    `${apiUrl}${API_ROUTES.ADMIN_REPORTS}?pageSize=20&status=${ReportStatus.OPEN}`,
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
    throw new Error("Failed to load admin reports");
  }

  const result = (await res.json()) as PaginatedResponse<ReportResponse>;
  return <ReportsClient initialData={result.data} initialMeta={result.meta} />;
}
