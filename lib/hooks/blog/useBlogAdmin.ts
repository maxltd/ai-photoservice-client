"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import {
  API_ROUTES,
  type BlogArticleResponse,
  type BlogHubSettingsResponse,
  type CreateBlogArticleRequest,
  type PaginatedResponse,
  type UpdateBlogArticleRequest,
  type UpdateBlogHubSettingsRequest,
} from "@/lib/api/contract";
import { queryKeys } from "@/lib/query/keys";

function unwrapData<T>(payload: T | { data: T }): T {
  return (payload as { data?: T }).data ?? (payload as T);
}

export function useAdminBlog(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: queryKeys.blog.adminPages(params ?? {}),
    queryFn: () =>
      apiGet<PaginatedResponse<BlogArticleResponse>>(API_ROUTES.ADMIN_BLOG, params),
    staleTime: 30_000,
  });
}

export function useAdminBlogArticle(id: string) {
  return useQuery({
    queryKey: queryKeys.blog.adminById(id),
    queryFn: async () => {
      const payload = await apiGet<BlogArticleResponse | { data: BlogArticleResponse }>(
        API_ROUTES.ADMIN_BLOG_BY_ID(id),
      );
      return unwrapData(payload);
    },
    enabled: Boolean(id),
  });
}

export function useAdminBlogHubSettings() {
  return useQuery({
    queryKey: queryKeys.blog.hub,
    queryFn: () => apiGet<BlogHubSettingsResponse>(API_ROUTES.ADMIN_BLOG_HUB),
    staleTime: 30_000,
  });
}

export function useUpdateBlogHubSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateBlogHubSettingsRequest) =>
      apiPatch<BlogHubSettingsResponse>(API_ROUTES.ADMIN_BLOG_HUB, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.blog.hub, data);
      toast.success("Настройки хаба блога обновлены");
    },
  });
}

export function useCreateBlogArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateBlogArticleRequest) => {
      const response = await apiPost<BlogArticleResponse | { data: BlogArticleResponse }>(
        API_ROUTES.ADMIN_BLOG,
        payload,
      );
      return unwrapData(response);
    },
    onSuccess: (article) => {
      queryClient.setQueryData(queryKeys.blog.adminById(article.id), article);
      void queryClient.invalidateQueries({ queryKey: ["admin", "blog"] });
      toast.success("Статья создана");
    },
  });
}

export function useUpdateBlogArticle(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateBlogArticleRequest) => {
      const response = await apiPatch<BlogArticleResponse | { data: BlogArticleResponse }>(
        API_ROUTES.ADMIN_BLOG_BY_ID(id),
        payload,
      );
      return unwrapData(response);
    },
    onSuccess: (article) => {
      queryClient.setQueryData(queryKeys.blog.adminById(id), article);
      void queryClient.invalidateQueries({ queryKey: ["admin", "blog"] });
    },
  });
}

export function usePublishBlogArticle(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiPost<BlogArticleResponse | { data: BlogArticleResponse }>(
        API_ROUTES.ADMIN_BLOG_PUBLISH(id),
        {},
      );
      return unwrapData(response);
    },
    onSuccess: (article) => {
      queryClient.setQueryData(queryKeys.blog.adminById(id), article);
      void queryClient.invalidateQueries({ queryKey: ["admin", "blog"] });
      toast.success("Статья опубликована");
    },
  });
}

export function useUnpublishBlogArticle(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiPost<BlogArticleResponse | { data: BlogArticleResponse }>(
        API_ROUTES.ADMIN_BLOG_UNPUBLISH(id),
        {},
      );
      return unwrapData(response);
    },
    onSuccess: (article) => {
      queryClient.setQueryData(queryKeys.blog.adminById(id), article);
      void queryClient.invalidateQueries({ queryKey: ["admin", "blog"] });
      toast.success("Статья снята с публикации");
    },
  });
}

export function useRestoreBlogArticle(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiPost<BlogArticleResponse | { data: BlogArticleResponse }>(
        API_ROUTES.ADMIN_BLOG_RESTORE(id),
        {},
      );
      return unwrapData(response);
    },
    onSuccess: (article) => {
      queryClient.setQueryData(queryKeys.blog.adminById(id), article);
      void queryClient.invalidateQueries({ queryKey: ["admin", "blog"] });
      toast.success("Статья восстановлена");
    },
  });
}

export function useDeleteBlogArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiDelete(API_ROUTES.ADMIN_BLOG_BY_ID(id)),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.blog.adminById(id) });
      void queryClient.invalidateQueries({ queryKey: ["admin", "blog"] });
      toast.success("Статья отправлена в архив");
    },
  });
}
