import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { GalleryClient } from "@/components/admin/gallery/GalleryClient";
import {
  API_ROUTES,
  GalleryStatus,
  type GalleryItemResponse,
  type PaginatedResponse,
} from "@/lib/api/contract";
import { requireAdmin } from "@/app/(admin)/admin/_lib/require-admin";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const cookieStore = await cookies();
  const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("API_URL is not set");
  }

  await requireAdmin(apiUrl, cookieStore.toString());

  const res = await fetch(
    `${apiUrl}${API_ROUTES.ADMIN_GALLERY}?pageSize=20&status=${GalleryStatus.PENDING}`,
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
    throw new Error("Failed to load admin gallery");
  }

  const result = (await res.json()) as PaginatedResponse<GalleryItemResponse>;
  return <GalleryClient initialData={result.data} initialMeta={result.meta} />;
}
