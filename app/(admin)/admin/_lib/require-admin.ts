import { redirect } from "next/navigation";
import { API_ROUTES, type GetMeResponse, Role } from "@/lib/api/contract";

interface MeResponse {
  data: GetMeResponse;
}

export async function requireAdmin(
  apiUrl: string,
  cookieHeader: string,
): Promise<void> {
  const meRes = await fetch(`${apiUrl}${API_ROUTES.AUTH_ME}`, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });

  if (meRes.status === 401) {
    redirect("/login");
  }

  if (!meRes.ok) {
    throw new Error("Failed to verify admin access");
  }

  const payload = (await meRes.json()) as MeResponse;

  if (payload.data.role !== Role.ADMIN) {
    redirect("/403");
  }
}
