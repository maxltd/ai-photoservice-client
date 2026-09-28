import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_ROUTES, type GetMeResponse } from "@/lib/api/contract";

interface MeResponse {
  data: GetMeResponse;
}

export const getCurrentUser = cache(async (): Promise<GetMeResponse> => {
  const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("API_URL is not set");
  }

  const response = await fetch(`${apiUrl}${API_ROUTES.AUTH_ME}`, {
    headers: {
      cookie: (await cookies()).toString(),
    },
    cache: "no-store",
  });

  if (response.status === 401) {
    redirect("/");
  }

  if (!response.ok) {
    throw new Error("Failed to load session");
  }

  const payload = (await response.json()) as MeResponse;
  return payload.data;
});
