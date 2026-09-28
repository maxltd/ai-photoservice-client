"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import {
  API_ROUTES,
  type CreatePhotoSessionStyleRequest,
  type StylesHubSettingsResponse,
  type PaginatedResponse,
  type PhotoSessionStyleResponse,
  type UpdatePhotoSessionStyleRequest,
  type UpdateStylesHubSettingsRequest,
} from "@/lib/api/contract";
import { queryKeys } from "@/lib/query/keys";

function unwrapData<T>(payload: T | { data: T }): T {
  return (payload as { data?: T }).data ?? (payload as T);
}

export function useStylesHubSettings() {
  return useQuery({
    queryKey: ["admin", "styles", "hub"],
    queryFn: async () => unwrapData(await apiGet<StylesHubSettingsResponse | { data: StylesHubSettingsResponse }>(API_ROUTES.ADMIN_PHOTO_SESSION_STYLES_HUB)),
    staleTime: 30_000,
  });
}

export function useUpdateStylesHubSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateStylesHubSettingsRequest) => unwrapData(await apiPatch<StylesHubSettingsResponse | { data: StylesHubSettingsResponse }>(API_ROUTES.ADMIN_PHOTO_SESSION_STYLES_HUB, data)),
    onSuccess: (settings) => { queryClient.setQueryData(["admin", "styles", "hub"], settings); toast.success("Настройки страницы сохранены"); },
  });
}

export function usePhotoSessionStyles(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: queryKeys.styles.adminPages(params ?? {}),
    queryFn: async () => {
      const payload = await apiGet<PaginatedResponse<PhotoSessionStyleResponse>>(
        API_ROUTES.ADMIN_PHOTO_SESSION_STYLES,
        params,
      );
      return payload;
    },
    staleTime: 30_000,
  });
}

export function usePhotoSessionStyle(id: string) {
  return useQuery({
    queryKey: queryKeys.styles.adminPageById(id),
    queryFn: async () => {
      const payload = await apiGet<PhotoSessionStyleResponse | { data: PhotoSessionStyleResponse }>(
        API_ROUTES.ADMIN_PHOTO_SESSION_STYLE(id),
      );
      return unwrapData(payload);
    },
    enabled: Boolean(id),
  });
}

export function useCreatePhotoSessionStyle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreatePhotoSessionStyleRequest) => {
      const payload = await apiPost<PhotoSessionStyleResponse | { data: PhotoSessionStyleResponse }>(
        API_ROUTES.ADMIN_PHOTO_SESSION_STYLES,
        data,
      );
      return unwrapData(payload);
    },
    onSuccess: (style) => {
      queryClient.setQueryData(queryKeys.styles.adminPageById(style.id), style);
      void queryClient.invalidateQueries({ queryKey: ["admin", "styles"] });
      toast.success("Стиль создан");
    },
  });
}

export function useUpdatePhotoSessionStyle(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdatePhotoSessionStyleRequest) => {
      const payload = await apiPatch<PhotoSessionStyleResponse | { data: PhotoSessionStyleResponse }>(
        API_ROUTES.ADMIN_PHOTO_SESSION_STYLE(id),
        data,
      );
      return unwrapData(payload);
    },
    onSuccess: (style) => {
      queryClient.setQueryData(queryKeys.styles.adminPageById(id), style);
      void queryClient.invalidateQueries({ queryKey: ["admin", "styles"] });
    },
  });
}

export function usePublishPhotoSessionStyle(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const payload = await apiPost<PhotoSessionStyleResponse | { data: PhotoSessionStyleResponse }>(
        API_ROUTES.ADMIN_PHOTO_SESSION_STYLE_PUBLISH(id),
        {},
      );
      return unwrapData(payload);
    },
    onSuccess: (style) => {
      queryClient.setQueryData(queryKeys.styles.adminPageById(id), style);
      void queryClient.invalidateQueries({ queryKey: ["admin", "styles"] });
      toast.success("Стиль опубликован");
    },
  });
}

export function useUnpublishPhotoSessionStyle(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const payload = await apiPost<PhotoSessionStyleResponse | { data: PhotoSessionStyleResponse }>(
        API_ROUTES.ADMIN_PHOTO_SESSION_STYLE_UNPUBLISH(id),
        {},
      );
      return unwrapData(payload);
    },
    onSuccess: (style) => {
      queryClient.setQueryData(queryKeys.styles.adminPageById(id), style);
      void queryClient.invalidateQueries({ queryKey: ["admin", "styles"] });
      toast.success("Стиль снят с публикации");
    },
  });
}

export function useRestorePhotoSessionStyle(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const payload = await apiPost<PhotoSessionStyleResponse | { data: PhotoSessionStyleResponse }>(
        API_ROUTES.ADMIN_PHOTO_SESSION_STYLE_RESTORE(id),
        {},
      );
      return unwrapData(payload);
    },
    onSuccess: (style) => {
      queryClient.setQueryData(queryKeys.styles.adminPageById(id), style);
      void queryClient.invalidateQueries({ queryKey: ["admin", "styles"] });
      toast.success("Стиль восстановлен");
    },
  });
}

export function useDeletePhotoSessionStyle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(API_ROUTES.ADMIN_PHOTO_SESSION_STYLE(id)),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.styles.adminPageById(id) });
      void queryClient.invalidateQueries({ queryKey: ["admin", "styles"] });
      toast.success("Стиль отправлен в архив");
    },
  });
}
