import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { UsersClient } from "@/components/admin/users/UsersClient";
import {
  API_ROUTES,
  type AdminUserListItemDto,
  type PaginatedResponse,
} from "@/lib/api/contract";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const cookieStore = await cookies();
  const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("API_URL is not set");
  }

  const res = await fetch(`${apiUrl}${API_ROUTES.ADMIN_USERS}?pageSize=20`, {
    headers: { cookie: cookieStore.toString() },
    cache: "no-store",
  });

  if (res.status === 401) {
    redirect("/?auth=1");
  }

  if (res.status === 403) {
    redirect("/403");
  }

  if (!res.ok) {
    throw new Error("Failed to load admin users");
  }

  const result = (await res.json()) as PaginatedResponse<AdminUserListItemDto>;
  return <UsersClient initialData={result.data} initialMeta={result.meta} />;
}
