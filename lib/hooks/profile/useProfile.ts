"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import {
  API_ROUTES,
  ApiError,
  type CreateUserAiProfilePhotoRequest,
  type GetMeResponse,
  type UserAiProfilePhotoResponse,
} from "@/lib/api/contract";
import { queryKeys } from "@/lib/query/keys";

export function useMe(initialData?: GetMeResponse) {
  return useQuery({
    queryKey: queryKeys.users.me,
    queryFn: () =>
      apiGet<{ data: GetMeResponse }>(API_ROUTES.USERS_ME).then(
        (response) => response.data,
      ),
    staleTime: 60_000,
    initialData,
  });
}

export function useAiProfilePhotos() {
  return useQuery({
    queryKey: queryKeys.users.aiProfilePhotos,
    queryFn: () =>
      apiGet<{ data: UserAiProfilePhotoResponse[] }>(
        API_ROUTES.USERS_ME_AI_PROFILE_PHOTOS,
      ).then((response) => response.data),
    staleTime: 30_000,
  });
}

export function useAddAiProfilePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateUserAiProfilePhotoRequest) =>
      apiPost<
        { data: UserAiProfilePhotoResponse },
        CreateUserAiProfilePhotoRequest
      >(API_ROUTES.USERS_ME_AI_PROFILE_PHOTOS, dto).then(
        (response) => response.data,
      ),
    onSuccess: (photo) => {
      queryClient.setQueryData<UserAiProfilePhotoResponse[]>(
        queryKeys.users.aiProfilePhotos,
        (prev = []) => {
          const withoutSameId = prev.filter((item) => item.id !== photo.id);
          return [photo, ...withoutSameId];
        },
      );
    },
  });
}

export function useRemoveAiProfilePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (photoId: string) =>
      apiDelete(API_ROUTES.USERS_ME_AI_PROFILE_PHOTO_BY_ID(photoId)),
    onSuccess: (_data, photoId) => {
      queryClient.setQueryData<UserAiProfilePhotoResponse[]>(
        queryKeys.users.aiProfilePhotos,
        (prev = []) => prev.filter((item) => item.id !== photoId),
      );
    },
  });
}

export function useUpdateMe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: { name?: string; image?: string | null }) =>
      apiPatch<{ data: GetMeResponse }>(API_ROUTES.USERS_ME, dto).then(
        (response) => response.data,
      ),
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.users.me, user);
      queryClient.setQueryData(["app", "me"], { data: user });
      queryClient.setQueryData(["app", "me", "header"], { data: user });
      queryClient.setQueryData(["app", "me", "sidebar"], { data: user });
      toast.success("Профиль обновлён");
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        toast.error(error.message || "Ошибка обновления");
        return;
      }

      toast.error("Ошибка обновления");
    },
  });
}
