import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { API_ROUTES, type PresetResponse } from "@/lib/api/contract";
import { toServerApiUrl } from "@/lib/api/server";
import { GenerationForm } from "@/components/create/GenerationForm";

interface ApiItemResponse<TData> {
  data: TData;
}

export default async function PresetPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cookieStore = await cookies();

  const res = await fetch(toServerApiUrl(API_ROUTES.PRESET_BY_SLUG(slug)), {
    headers: { cookie: cookieStore.toString() },
    cache: "no-store",
  });

  if (res.status === 404) {
    notFound();
  }

  if (!res.ok) {
    throw new Error("Failed to load preset");
  }

  const json = (await res.json()) as ApiItemResponse<PresetResponse>;

  return <GenerationForm preset={json.data} />;
}
