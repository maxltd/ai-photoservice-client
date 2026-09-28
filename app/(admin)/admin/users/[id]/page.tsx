import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { UserDetailClient } from "@/components/admin/users/UserDetailClient";
import { API_ROUTES, type AdminUserDetailDto } from "@/lib/api/contract";

interface AdminUserPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function AdminUserPage({ params }: AdminUserPageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("API_URL is not set");
  }

  const res = await fetch(`${apiUrl}${API_ROUTES.ADMIN_USER_BY_ID(id)}`, {
    headers: { cookie: cookieStore.toString() },
    cache: "no-store",
  });

  if (res.status === 404) {
    notFound();
  }

  if (!res.ok) {
    throw new Error("Failed to load user");
  }

  const payload = (await res.json()) as
    | AdminUserDetailDto
    | { data: AdminUserDetailDto };

  const user = "data" in payload ? payload.data : payload;

  return <UserDetailClient initialData={user} />;
}
