"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiGet, apiPatch } from "@/lib/api/client";
import {
  API_ROUTES,
  ApiError,
  type AdminUserDetailDto,
  type AdminUserListItemDto,
  type PaginatedResponse,
  type Role,
  type UpdateUserRoleRequest,
  type UserStatus,
} from "@/lib/api/contract";
import { queryKeys } from "@/lib/query/keys";

interface ApiData<TData> {
  data: TData;
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

function unwrapList<TData>(
  payload: PaginatedResponse<TData> | ApiData<PaginatedResponse<TData>>,
): PaginatedResponse<TData> {
  if ("meta" in payload && Array.isArray(payload.data)) {
    return payload;
  }

  return (payload as ApiData<PaginatedResponse<TData>>).data;
}

export function useAdminUsers(
  params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    role?: Role;
    status?: UserStatus;
  },
  initialData?: PaginatedResponse<AdminUserListItemDto>,
) {
  return useQuery({
    queryKey: queryKeys.admin.users(params ?? {}),
    queryFn: () =>
      apiGet<
        | PaginatedResponse<AdminUserListItemDto>
        | ApiData<PaginatedResponse<AdminUserListItemDto>>
      >(API_ROUTES.ADMIN_USERS, {
        page: params?.page,
        pageSize: params?.pageSize ?? 20,
        search: params?.search || undefined,
        role: params?.role,
        status: params?.status,
      }).then((response) => unwrapList(response)),
    initialData,
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function useAdminUserById(id: string) {
  return useQuery({
    queryKey: queryKeys.admin.userById(id),
    queryFn: () =>
      apiGet<AdminUserDetailDto | ApiData<AdminUserDetailDto>>(
        API_ROUTES.ADMIN_USER_BY_ID(id),
      ).then((response) => unwrapItem(response)),
    staleTime: 0,
    refetchOnMount: "always",
    enabled: !!id,
  });
}

export function useUpdateUserRole(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (role: Role) =>
      apiPatch<AdminUserListItemDto>(API_ROUTES.ADMIN_USER_ROLE(userId), {
        role,
      } satisfies UpdateUserRoleRequest),
    onSuccess: (updated) => {
      queryClient.setQueryData(
        queryKeys.admin.userById(userId),
        (old: AdminUserDetailDto | undefined) =>
          old ? { ...old, role: updated.role } : old,
      );
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.users({}),
      });
      toast.success("Роль обновлена");
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        toast.error(error.message ?? "Ошибка обновления роли");
      }
    },
  });
}
