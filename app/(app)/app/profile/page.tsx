import { cookies } from "next/headers";
import { ProfileClient } from "@/components/profile/ProfileClient";
import { redirectToAuth } from "@/lib/auth/auth-redirect";
import { API_ROUTES, type GetMeResponse } from "@/lib/api/contract";
import { toServerApiUrl } from "@/lib/api/server";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const cookieStore = await cookies();

  const res = await fetch(toServerApiUrl(API_ROUTES.USERS_ME), {
    headers: { cookie: cookieStore.toString() },
    cache: "no-store",
  });

  if (res.status === 401) {
    redirectToAuth("/app/profile");
  }

  if (!res.ok) {
    throw new Error("Failed to load profile");
  }

  const json = (await res.json()) as { data: GetMeResponse };
  return <ProfileClient initialUser={json.data} />;
}
