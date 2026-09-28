"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiGet, apiPatch } from "@/lib/api/client";
import {
  API_ROUTES,
  ApiError,
  type AppSettingResponse,
  type UpdateAppSettingRequest,
} from "@/lib/api/contract";
import { queryKeys } from "@/lib/query/keys";

export function useAdminSettings() {
  return useQuery({
    queryKey: queryKeys.admin.settings,
    queryFn: () => apiGet<AppSettingResponse[]>(API_ROUTES.ADMIN_SETTINGS),
    staleTime: 60_000,
  });
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();

  return useMutation<
    AppSettingResponse,
    ApiError,
    { key: string; value: string }
  >({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      apiPatch<AppSettingResponse>(API_ROUTES.ADMIN_SETTING_BY_KEY(key), {
        value,
      } satisfies UpdateAppSettingRequest),
    onSuccess: (updated) => {
      queryClient.setQueryData(
        queryKeys.admin.settings,
        (old: AppSettingResponse[] | undefined) =>
          old?.map((setting) =>
            setting.key === updated.key ? updated : setting,
          ) ?? [updated],
      );
      toast.success("Настройка сохранена");
    },
    onError: (error) => {
      toast.error(error.message ?? "Ошибка сохранения настройки");
    },
  });
}
