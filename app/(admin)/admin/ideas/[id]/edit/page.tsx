import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { PhotoSessionIdeaEditor } from "@/components/admin/ideas/PhotoSessionIdeaEditor";
import { API_ROUTES, type PhotoSessionIdeaResponse } from "@/lib/api/contract";

export default async function EditPhotoSessionIdeaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error("API_URL is not set");
  const response = await fetch(`${apiUrl}${API_ROUTES.ADMIN_PHOTO_SESSION_IDEA(id)}`, { headers: { cookie: (await cookies()).toString() }, cache: "no-store" });
  if (response.status === 404) notFound();
  if (!response.ok) throw new Error("Failed to load photo session idea");
  const payload = (await response.json()) as PhotoSessionIdeaResponse | { data: PhotoSessionIdeaResponse };
  return <PhotoSessionIdeaEditor initialData={"data" in payload ? payload.data : payload} />;
}
