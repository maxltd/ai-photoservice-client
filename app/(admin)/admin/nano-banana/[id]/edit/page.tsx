import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { NanoBananaPageEditor } from "@/components/admin/nano-banana/NanoBananaPageEditor";
import { API_ROUTES, type NanoBananaPageResponse } from "@/lib/api/contract";

export const dynamic = "force-dynamic";
export default async function EditNanoBananaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error("API_URL is not set");
  const response = await fetch(
    `${apiUrl}${API_ROUTES.ADMIN_NANO_BANANA_BY_ID(id)}`,
    { headers: { cookie: (await cookies()).toString() }, cache: "no-store" },
  );
  if (response.status === 404) notFound();
  if (response.status === 401) redirect("/?auth=1");
  if (response.status === 403) redirect("/403");
  if (!response.ok) throw new Error("Failed to load Nano Banana page");
  const payload = (await response.json()) as
    | NanoBananaPageResponse
    | { data: NanoBananaPageResponse };
  return (
    <NanoBananaPageEditor
      initialData={"data" in payload ? payload.data : payload}
    />
  );
}
