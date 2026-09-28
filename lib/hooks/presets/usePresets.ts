"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  API_ROUTES,
  type CreatePresetRequest,
  type PaginatedResponse,
  type PresetListItemResponse,
  type PresetResponse,
  type ReorderRequest,
  type UpdatePresetRequest,
} from "@/lib/api/contract";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";

interface PresetsParams {
  search?: string;
  categoryId?: string;
  featured?: boolean;
}

interface ApiData<TData> {
  data: TData;
}

function unwrapList(
  payload:
    | PaginatedResponse<PresetListItemResponse>
    | ApiData<PaginatedResponse<PresetListItemResponse>>,
): PaginatedResponse<PresetListItemResponse> {
  if ("meta" in payload && Array.isArray(payload.data)) {
    return payload;
  }

  return (payload as ApiData<PaginatedResponse<PresetListItemResponse>>).data;
}

function unwrapItem<TData>(payload: TData | ApiData<TData>): TData {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in (payload as Record<string, unknown>)
  ) {
    return (payload as ApiData<TData>).data;
  }

  return payload as TData;
}

export function usePresets(
  params?: PresetsParams,
  initialData?: PresetListItemResponse[],
) {
  return useQuery({
    queryKey: queryKeys.presets.list(params ?? {}),
    queryFn: async () => {
      const response = await apiGet<
        | PaginatedResponse<PresetListItemResponse>
        | ApiData<PaginatedResponse<PresetListItemResponse>>
      >(API_ROUTES.ADMIN_PRESETS, {
        search: params?.search,
        categoryId: params?.categoryId,
        featured: params?.featured,
      });

      const payload = unwrapList(response);
      return payload.data;
    },
    initialData,
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function usePresetBySlug(slug: string, initialData?: PresetResponse) {
  return useQuery({
    queryKey: queryKeys.presets.bySlug(slug),
    queryFn: async () => {
      const response = await apiGet<PresetResponse | ApiData<PresetResponse>>(
        API_ROUTES.PRESET_BY_SLUG(slug),
      );
      return unwrapItem(response);
    },
    enabled: Boolean(slug),
    initialData,
  });
}

export function usePresetByIdAdmin(id: string, initialData?: PresetResponse) {
  return useQuery({
    queryKey: queryKeys.presets.byId(id),
    queryFn: async () => {
      const response = await apiGet<PresetResponse | ApiData<PresetResponse>>(
        API_ROUTES.ADMIN_PRESET_BY_ID(id),
      );
      return unwrapItem(response);
    },
    enabled: Boolean(id),
    initialData,
  });
}

export function useCreatePreset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePresetRequest) => {
      const response = await apiPost<
        PresetResponse | ApiData<PresetResponse>,
        CreatePresetRequest
      >(API_ROUTES.PRESETS, payload);
      return unwrapItem(response);
    },
    onSuccess: () => {
      toast.success("Пресет создан");
      void queryClient.invalidateQueries({ queryKey: queryKeys.presets.all });
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Произошла ошибка";
      toast.error(message);
    },
  });
}

export function useUpdatePreset(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdatePresetRequest) => {
      const response = await apiPatch<
        PresetResponse | ApiData<PresetResponse>,
        UpdatePresetRequest
      >(API_ROUTES.PRESET_BY_ID(id), payload);
      return unwrapItem(response);
    },
    onSuccess: () => {
      toast.success("Пресет обновлён");
      void queryClient.invalidateQueries({ queryKey: queryKeys.presets.all });
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Произошла ошибка";
      toast.error(message);
    },
  });
}

export function useDeletePreset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiDelete(API_ROUTES.PRESET_BY_ID(id));
    },
    onSuccess: () => {
      toast.success("Пресет удалён");
      void queryClient.invalidateQueries({ queryKey: queryKeys.presets.all });
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Произошла ошибка";
      toast.error(message);
    },
  });
}

export function useReorderPresets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ReorderRequest) => {
      await apiPatch<void, ReorderRequest>(API_ROUTES.PRESETS_REORDER, payload);
      return payload;
    },
    onMutate: async (newOrder) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.presets.all });

      const previousEntries = queryClient.getQueriesData<
        PresetListItemResponse[]
      >({
        queryKey: queryKeys.presets.all,
      });

      for (const [key, value] of previousEntries) {
        if (!value) {
          continue;
        }

        const map = new Map(
          newOrder.items.map((item) => [item.id, item.sortOrder]),
        );

        queryClient.setQueryData(
          key,
          value.map((preset) => {
            const nextOrder = map.get(preset.id);
            return nextOrder === undefined
              ? preset
              : { ...preset, sortOrder: nextOrder };
          }),
        );
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
      toast.success("Порядок пресетов сохранён");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.presets.all });
    },
  });
}
