import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { API_ROUTES, type PhotoSessionResponse } from "@/lib/api/contract";
import { toServerApiUrl } from "@/lib/api/server";
import { SessionGenerationForm } from "../../../../../components/sessions/SessionGenerationForm";

interface ApiItemResponse<TData> {
  data: TData;
}

export default async function SessionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cookieStore = await cookies();

  const res = await fetch(
    toServerApiUrl(API_ROUTES.PHOTO_SESSION_BY_SLUG(slug)),
    {
      headers: { cookie: cookieStore.toString() },
      cache: "no-store",
    },
  );

  if (res.status === 404) {
    notFound();
  }

  if (!res.ok) {
    throw new Error("Failed to load photo session");
  }

  const json = (await res.json()) as ApiItemResponse<PhotoSessionResponse>;

  return <SessionGenerationForm session={json.data} />;
}
