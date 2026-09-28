"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import {
  API_ROUTES,
  ApiError,
  type CmsPageResponse,
  type CreateCmsPageRequest,
  type PaginatedResponse,
  type UpdateCmsPageRequest,
} from "@/lib/api/contract";
import { queryKeys } from "@/lib/query/keys";

export function useCmsPages(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  isPublished?: boolean;
}) {
  return useQuery({
    queryKey: queryKeys.cms.adminPages(params ?? {}),
    queryFn: () =>
      apiGet<PaginatedResponse<CmsPageResponse>>(API_ROUTES.ADMIN_CMS_PAGES, {
        page: params?.page,
        pageSize: params?.pageSize ?? 20,
        search: params?.search || undefined,
        isPublished: params?.isPublished,
      }),
    staleTime: 30_000,
  });
}

export function useCmsPageById(id: string) {
  return useQuery({
    queryKey: queryKeys.cms.adminPageById(id),
    queryFn: () => apiGet<CmsPageResponse>(API_ROUTES.ADMIN_CMS_PAGE_BY_ID(id)),
    staleTime: 30_000,
    enabled: !!id,
  });
}

export function useCreateCmsPage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateCmsPageRequest) =>
      apiPost<CmsPageResponse>(API_ROUTES.ADMIN_CMS_PAGES, dto),
    onSuccess: (created) => {
      queryClient.setQueryData(queryKeys.cms.adminPageById(created.id), created);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.cms.adminPages({}),
      });
      toast.success("Страница создана");
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        toast.error(error.message ?? "Ошибка создания страницы");
      }
    },
  });
}

export function useUpdateCmsPage(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdateCmsPageRequest) =>
      apiPatch<CmsPageResponse>(API_ROUTES.ADMIN_CMS_PAGE(id), dto),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.cms.adminPageById(id), updated);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.cms.adminPages({}),
      });
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        toast.error(error.message ?? "Ошибка сохранения");
      }
    },
  });
}

export function useDeleteCmsPage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiDelete(API_ROUTES.ADMIN_CMS_PAGE(id)),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.cms.adminPageById(id) });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.cms.adminPages({}),
      });
      toast.success("Страница удалена");
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        toast.error(error.message ?? "Ошибка удаления");
      }
    },
  });
}
