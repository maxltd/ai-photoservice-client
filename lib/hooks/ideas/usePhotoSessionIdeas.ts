"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import { API_ROUTES, type CreatePhotoSessionIdeaRequest, type IdeasHubSettingsResponse, type PaginatedResponse, type PhotoSessionIdeaResponse, type UpdateIdeasHubSettingsRequest, type UpdatePhotoSessionIdeaRequest } from "@/lib/api/contract";
import { queryKeys } from "@/lib/query/keys";

function unwrapData<T>(payload: T | { data: T }): T {
  return (payload as { data?: T }).data ?? (payload as T);
}

export function useIdeasHubSettings() {
  return useQuery({
    queryKey: ["admin", "ideas", "hub"],
    queryFn: async () => unwrapData(await apiGet<IdeasHubSettingsResponse | { data: IdeasHubSettingsResponse }>(API_ROUTES.ADMIN_PHOTO_SESSION_IDEAS_HUB)),
    staleTime: 30_000,
  });
}

export function useUpdateIdeasHubSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateIdeasHubSettingsRequest) => unwrapData(await apiPatch<IdeasHubSettingsResponse | { data: IdeasHubSettingsResponse }>(API_ROUTES.ADMIN_PHOTO_SESSION_IDEAS_HUB, data)),
    onSuccess: (settings) => { queryClient.setQueryData(["admin", "ideas", "hub"], settings); toast.success("Настройки страницы сохранены"); },
  });
}

export function usePhotoSessionIdeas(params?: { page?: number; pageSize?: number; search?: string; status?: string }) {
  return useQuery({ queryKey: queryKeys.ideas.adminPages(params ?? {}), queryFn: async () => {
    const payload = await apiGet<PaginatedResponse<PhotoSessionIdeaResponse>>(API_ROUTES.ADMIN_PHOTO_SESSION_IDEAS, params);
    return payload;
  }, staleTime: 30_000 });
}

export function usePhotoSessionIdea(id: string) {
  return useQuery({ queryKey: queryKeys.ideas.adminPageById(id), queryFn: async () => {
    const payload = await apiGet<PhotoSessionIdeaResponse | { data: PhotoSessionIdeaResponse }>(API_ROUTES.ADMIN_PHOTO_SESSION_IDEA(id));
    return unwrapData(payload);
  }, enabled: Boolean(id) });
}

export function useCreatePhotoSessionIdea() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: async (data: CreatePhotoSessionIdeaRequest) => {
    const payload = await apiPost<PhotoSessionIdeaResponse | { data: PhotoSessionIdeaResponse }>(API_ROUTES.ADMIN_PHOTO_SESSION_IDEAS, data);
    return unwrapData(payload);
  }, onSuccess: (idea) => { queryClient.setQueryData(queryKeys.ideas.adminPageById(idea.id), idea); void queryClient.invalidateQueries({ queryKey: ["admin", "ideas"] }); toast.success("Идея создана"); } });
}

export function useUpdatePhotoSessionIdea(id: string) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: async (data: UpdatePhotoSessionIdeaRequest) => {
    const payload = await apiPatch<PhotoSessionIdeaResponse | { data: PhotoSessionIdeaResponse }>(API_ROUTES.ADMIN_PHOTO_SESSION_IDEA(id), data);
    return unwrapData(payload);
  }, onSuccess: (idea) => { queryClient.setQueryData(queryKeys.ideas.adminPageById(id), idea); void queryClient.invalidateQueries({ queryKey: ["admin", "ideas"] }); } });
}

export function usePublishPhotoSessionIdea(id: string) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: async () => {
    const payload = await apiPost<PhotoSessionIdeaResponse | { data: PhotoSessionIdeaResponse }>(API_ROUTES.ADMIN_PHOTO_SESSION_IDEA_PUBLISH(id), {});
    return unwrapData(payload);
  }, onSuccess: (idea) => { queryClient.setQueryData(queryKeys.ideas.adminPageById(id), idea); void queryClient.invalidateQueries({ queryKey: ["admin", "ideas"] }); toast.success("Идея опубликована"); } });
}

export function useUnpublishPhotoSessionIdea(id: string) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: async () => {
    const payload = await apiPost<PhotoSessionIdeaResponse | { data: PhotoSessionIdeaResponse }>(API_ROUTES.ADMIN_PHOTO_SESSION_IDEA_UNPUBLISH(id), {});
    return unwrapData(payload);
  }, onSuccess: (idea) => { queryClient.setQueryData(queryKeys.ideas.adminPageById(id), idea); void queryClient.invalidateQueries({ queryKey: ["admin", "ideas"] }); toast.success("Идея снята с публикации"); } });
}

export function useRestorePhotoSessionIdea(id: string) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: async () => {
    const payload = await apiPost<PhotoSessionIdeaResponse | { data: PhotoSessionIdeaResponse }>(API_ROUTES.ADMIN_PHOTO_SESSION_IDEA_RESTORE(id), {});
    return unwrapData(payload);
  }, onSuccess: (idea) => { queryClient.setQueryData(queryKeys.ideas.adminPageById(id), idea); void queryClient.invalidateQueries({ queryKey: ["admin", "ideas"] }); toast.success("Идея восстановлена"); } });
}

export function useDeletePhotoSessionIdea() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (id: string) => apiDelete(API_ROUTES.ADMIN_PHOTO_SESSION_IDEA(id)), onSuccess: (_data, id) => { queryClient.removeQueries({ queryKey: queryKeys.ideas.adminPageById(id) }); void queryClient.invalidateQueries({ queryKey: ["admin", "ideas"] }); toast.success("Идея отправлена в архив"); } });
}
