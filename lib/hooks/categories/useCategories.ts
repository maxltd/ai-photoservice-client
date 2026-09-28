"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  API_ROUTES,
  type CategoryResponse,
  type CreateCategoryRequest,
  type PaginatedResponse,
  type ReorderRequest,
  type UpdateCategoryRequest,
} from "@/lib/api/contract";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";

interface CategoriesParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

interface ApiData<TData> {
  data: TData;
}

function buildParams(
  params?: CategoriesParams,
): Record<string, string | number | boolean | undefined> {
  return {
    page: params?.page,
    pageSize: params?.pageSize,
    search: params?.search,
  };
}

function unwrapListResponse(
  payload:
    | PaginatedResponse<CategoryResponse>
    | ApiData<PaginatedResponse<CategoryResponse>>,
): PaginatedResponse<CategoryResponse> {
  if ("meta" in payload && Array.isArray(payload.data)) {
    return payload;
  }

  return (payload as ApiData<PaginatedResponse<CategoryResponse>>).data;
}

function unwrapItemResponse<TData>(payload: TData | ApiData<TData>): TData {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in (payload as Record<string, unknown>)
  ) {
    return (payload as ApiData<TData>).data;
  }

  return payload as TData;
}

export function useCategories(
  params?: CategoriesParams,
  initialData?: PaginatedResponse<CategoryResponse>,
) {
  return useQuery({
    queryKey: queryKeys.categories.list(params ?? {}),
    queryFn: async () => {
      const payload = await apiGet<
        | PaginatedResponse<CategoryResponse>
        | ApiData<PaginatedResponse<CategoryResponse>>
      >(API_ROUTES.ADMIN_CATEGORIES, buildParams(params));
      return unwrapListResponse(payload);
    },
    initialData,
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function useCategoryBySlug(
  slug: string,
  initialData?: CategoryResponse,
) {
  return useQuery({
    queryKey: queryKeys.categories.bySlug(slug),
    queryFn: async () => {
      const payload = await apiGet<
        CategoryResponse | ApiData<CategoryResponse>
      >(API_ROUTES.CATEGORIES_BY_SLUG(slug));
      return unwrapItemResponse(payload);
    },
    initialData,
    enabled: Boolean(slug),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateCategoryRequest) => {
      const response = await apiPost<
        CategoryResponse | ApiData<CategoryResponse>,
        CreateCategoryRequest
      >(API_ROUTES.CATEGORIES, payload);
      return unwrapItemResponse(response);
    },
    onSuccess: () => {
      toast.success("Категория создана");
      void queryClient.invalidateQueries({
        queryKey: queryKeys.categories.all,
      });
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Произошла ошибка";
      toast.error(message);
    },
  });
}

export function useUpdateCategory(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateCategoryRequest) => {
      const response = await apiPatch<
        CategoryResponse | ApiData<CategoryResponse>,
        UpdateCategoryRequest
      >(API_ROUTES.CATEGORY_BY_ID(id), payload);
      return unwrapItemResponse(response);
    },
    onSuccess: () => {
      toast.success("Категория обновлена");
      void queryClient.invalidateQueries({
        queryKey: queryKeys.categories.all,
      });
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Произошла ошибка";
      toast.error(message);
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiDelete(API_ROUTES.CATEGORY_BY_ID(id));
    },
    onSuccess: () => {
      toast.success("Категория удалена");
      void queryClient.invalidateQueries({
        queryKey: queryKeys.categories.all,
      });
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Произошла ошибка";
      toast.error(message);
    },
  });
}

export function useReorderCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ReorderRequest) => {
      await apiPatch<void, ReorderRequest>(
        API_ROUTES.CATEGORIES_REORDER,
        payload,
      );
      return payload;
    },
    onMutate: async (newOrder) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.categories.all });

      const previousEntries = queryClient.getQueriesData<
        PaginatedResponse<CategoryResponse>
      >({
        queryKey: queryKeys.categories.all,
      });

      for (const [key, value] of previousEntries) {
        if (!value) {
          continue;
        }

        const map = new Map(
          newOrder.items.map((item) => [item.id, item.sortOrder]),
        );
        const nextData = value.data.map((category) => {
          const nextOrder = map.get(category.id);
          return nextOrder === undefined
            ? category
            : { ...category, sortOrder: nextOrder };
        });

        queryClient.setQueryData(key, { ...value, data: nextData });
      }

      return { previousEntries };
    },
    onError: (_error, _variables, context) => {
      context?.previousEntries.forEach(([key, value]) => {
        queryClient.setQueryData(key, value);
      });
      toast.error("Не удалось сохранить порядок");
    },
    onSuccess: () => {
      toast.success("Порядок категорий сохранён");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.categories.all,
      });
    },
  });
}
