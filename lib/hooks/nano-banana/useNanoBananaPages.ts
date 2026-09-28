"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import {
  API_ROUTES,
  type CreateNanoBananaRequest,
  type NanoBananaHubSettingsResponse,
  type NanoBananaPageResponse,
  type PaginatedResponse,
  type UpdateNanoBananaHubRequest,
  type UpdateNanoBananaRequest,
} from "@/lib/api/contract";
import { queryKeys } from "@/lib/query/keys";

function unwrap<T>(payload: T | { data: T }): T {
  return (payload as { data?: T }).data ?? (payload as T);
}

export function useNanoBananaPages(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: queryKeys.nanoBanana.adminPages(params ?? {}),
    queryFn: () =>
      apiGet<PaginatedResponse<NanoBananaPageResponse>>(
        API_ROUTES.ADMIN_NANO_BANANA,
        params,
      ),
    staleTime: 30_000,
  });
}
export function useNanoBananaPage(id: string) {
  return useQuery({
    queryKey: queryKeys.nanoBanana.adminPageById(id),
    queryFn: async () =>
      unwrap(
        await apiGet<NanoBananaPageResponse | { data: NanoBananaPageResponse }>(
          API_ROUTES.ADMIN_NANO_BANANA_BY_ID(id),
        ),
      ),
    enabled: Boolean(id),
  });
}
export function useNanoBananaHub() {
  return useQuery({
    queryKey: queryKeys.nanoBanana.hub,
    queryFn: async () =>
      unwrap(
        await apiGet<
          | NanoBananaHubSettingsResponse
          | { data: NanoBananaHubSettingsResponse }
        >(API_ROUTES.ADMIN_NANO_BANANA_HUB),
      ),
  });
}
export function useCreateNanoBanana() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateNanoBananaRequest) =>
      unwrap(
        await apiPost<
          NanoBananaPageResponse | { data: NanoBananaPageResponse },
          CreateNanoBananaRequest
        >(API_ROUTES.ADMIN_NANO_BANANA, body),
      ),
    onSuccess: (page) => {
      client.setQueryData(queryKeys.nanoBanana.adminPageById(page.id), page);
      void client.invalidateQueries({ queryKey: ["admin", "nano-banana"] });
      toast.success("Страница создана");
    },
  });
}
export function useUpdateNanoBanana(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpdateNanoBananaRequest) =>
      unwrap(
        await apiPatch<
          NanoBananaPageResponse | { data: NanoBananaPageResponse },
          UpdateNanoBananaRequest
        >(API_ROUTES.ADMIN_NANO_BANANA_BY_ID(id), body),
      ),
    onSuccess: (page) => {
      client.setQueryData(queryKeys.nanoBanana.adminPageById(id), page);
      void client.invalidateQueries({ queryKey: ["admin", "nano-banana"] });
      toast.success("Изменения сохранены");
    },
  });
}
export function usePublishNanoBanana(id: string) {
  return useLifecycleMutation(
    id,
    API_ROUTES.ADMIN_NANO_BANANA_PUBLISH,
    "Страница опубликована",
  );
}
export function useUnpublishNanoBanana(id: string) {
  return useLifecycleMutation(
    id,
    API_ROUTES.ADMIN_NANO_BANANA_UNPUBLISH,
    "Публикация снята",
  );
}
export function useRestoreNanoBanana(id: string) {
  return useLifecycleMutation(
    id,
    API_ROUTES.ADMIN_NANO_BANANA_RESTORE,
    "Страница восстановлена",
  );
}
function useLifecycleMutation(
  id: string,
  route: (id: string) => string,
  message: string,
) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async () =>
      unwrap(
        await apiPost<
          NanoBananaPageResponse | { data: NanoBananaPageResponse }
        >(route(id), {}),
      ),
    onSuccess: (page) => {
      client.setQueryData(queryKeys.nanoBanana.adminPageById(id), page);
      void client.invalidateQueries({ queryKey: ["admin", "nano-banana"] });
      toast.success(message);
    },
  });
}
export function useDeleteNanoBanana() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiDelete(API_ROUTES.ADMIN_NANO_BANANA_BY_ID(id)),
    onSuccess: (_data, id) => {
      client.removeQueries({
        queryKey: queryKeys.nanoBanana.adminPageById(id),
      });
      void client.invalidateQueries({ queryKey: ["admin", "nano-banana"] });
      toast.success("Страница отправлена в архив");
    },
  });
}
export function useUpdateNanoBananaHub() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpdateNanoBananaHubRequest) =>
      unwrap(
        await apiPatch<
          | NanoBananaHubSettingsResponse
          | { data: NanoBananaHubSettingsResponse },
          UpdateNanoBananaHubRequest
        >(API_ROUTES.ADMIN_NANO_BANANA_HUB, body),
      ),
    onSuccess: (hub) => {
      client.setQueryData(queryKeys.nanoBanana.hub, hub);
      toast.success("Настройки хаба сохранены");
    },
  });
}
