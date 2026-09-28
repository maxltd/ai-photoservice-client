import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import {
  API_ROUTES,
  type CategoryResponse,
  type PaginatedResponse,
  type PhotoSessionResponse,
} from "@/lib/api/contract";
import { PhotoSessionEditor } from "@/components/admin/sessions/PhotoSessionEditor";

interface EditSessionPageProps {
  params: Promise<{ id: string }>;
}

async function getData(id: string): Promise<{
  session: PhotoSessionResponse | null;
  categories: CategoryResponse[];
}> {
  const cookieStore = await cookies();
  const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("API_URL is not set");
  }

  const [sessionRes, categoriesRes] = await Promise.all([
    fetch(`${apiUrl}${API_ROUTES.ADMIN_PHOTO_SESSION_BY_ID(id)}`, {
      headers: { cookie: cookieStore.toString() },
      cache: "no-store",
    }),
    fetch(`${apiUrl}${API_ROUTES.ADMIN_CATEGORIES}?pageSize=100`, {
      headers: { cookie: cookieStore.toString() },
      cache: "no-store",
    }),
  ]);

  if (sessionRes.status === 404) {
    return { session: null, categories: [] };
  }

  if (!sessionRes.ok || !categoriesRes.ok) {
    return { session: null, categories: [] };
  }

  const sessionPayload = (await sessionRes.json()) as
    | PhotoSessionResponse
    | { data: PhotoSessionResponse };
  const categoriesPayload =
    (await categoriesRes.json()) as PaginatedResponse<CategoryResponse>;

  return {
    session: "data" in sessionPayload ? sessionPayload.data : sessionPayload,
    categories: categoriesPayload.data,
  };
}

export default async function EditSessionPage({
  params,
}: EditSessionPageProps) {
  const { id } = await params;
  const { session, categories } = await getData(id);

  if (!session) {
    notFound();
  }

  return <PhotoSessionEditor initialData={session} categories={categories} />;
}
