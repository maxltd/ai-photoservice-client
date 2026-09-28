"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/client";
import {
  API_ROUTES,
  type PhotoSessionListItemResponse,
  type PhotoSessionResponse,
} from "@/lib/api/contract";
import { queryKeys } from "@/lib/query/keys";

export function usePhotoSessions() {
  return useQuery({
    queryKey: queryKeys.photoSessions.all,
    queryFn: () =>
      apiGet<{ data: PhotoSessionListItemResponse[] }>(API_ROUTES.PHOTO_SESSIONS).then(
        (response) => response.data,
      ),
    staleTime: 60_000,
  });
}

export function usePhotoSessionBySlug(slug: string) {
  return useQuery({
    queryKey: queryKeys.photoSessions.bySlug(slug),
    queryFn: () =>
      apiGet<{ data: PhotoSessionResponse }>(API_ROUTES.PHOTO_SESSION_BY_SLUG(slug)).then(
        (response) => response.data,
      ),
    enabled: Boolean(slug),
    staleTime: 5 * 60_000,
  });
}
