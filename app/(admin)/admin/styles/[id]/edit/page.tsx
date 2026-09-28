import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { PhotoSessionStyleEditor } from "@/components/admin/styles/PhotoSessionStyleEditor";
import { API_ROUTES, type PhotoSessionStyleResponse } from "@/lib/api/contract";

export default async function EditPhotoSessionStylePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error("API_URL is not set");
  const response = await fetch(`${apiUrl}${API_ROUTES.ADMIN_PHOTO_SESSION_STYLE(id)}`, { headers: { cookie: (await cookies()).toString() }, cache: "no-store" });
  if (response.status === 404) notFound();
  if (!response.ok) throw new Error("Failed to load photo session style");
  const payload = (await response.json()) as PhotoSessionStyleResponse | { data: PhotoSessionStyleResponse };
  return <PhotoSessionStyleEditor initialData={"data" in payload ? payload.data : payload} />;
}
