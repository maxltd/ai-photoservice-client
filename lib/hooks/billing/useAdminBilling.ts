"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiGet, apiPatch, apiPost } from "@/lib/api/client";
import {
  API_ROUTES,
  ApiError,
  type AdminAdjustBalanceRequest,
  type BillingPlanResponse,
  type CreateBillingPlanRequest,
  type PaginatedResponse,
  type TokenTransactionResponse,
  type TokenTransactionType,
  type UpdateBillingPlanRequest,
} from "@/lib/api/contract";
import { queryKeys } from "@/lib/query/keys";

export function useAdminTransactions(
  params?: {
    page?: number;
    pageSize?: number;
    userId?: string;
    type?: TokenTransactionType;
  },
  initialData?: PaginatedResponse<TokenTransactionResponse>,
) {
  return useQuery({
    queryKey: queryKeys.billing.adminTransactions(params ?? {}),
    queryFn: () =>
      apiGet<PaginatedResponse<TokenTransactionResponse>>(
        API_ROUTES.ADMIN_BILLING_TRANSACTIONS,
        {
          page: params?.page,
          pageSize: params?.pageSize ?? 25,
          userId: params?.userId || undefined,
          type: params?.type,
        },
      ),
    initialData,
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function useAdminBillingPlans(initialData?: BillingPlanResponse[]) {
  return useQuery({
    queryKey: queryKeys.billing.adminPlans,
    queryFn: () =>
      apiGet<{ data: BillingPlanResponse[] }>(
        API_ROUTES.ADMIN_BILLING_PLANS,
      ).then((response) => response.data),
    initialData,
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function useCreateBillingPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateBillingPlanRequest) =>
      apiPost<{ data: BillingPlanResponse }>(
        API_ROUTES.ADMIN_BILLING_PLANS,
        dto,
      ).then((response) => response.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.billing.adminPlans,
      });
      toast.success("Тарифный план создан");
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        toast.error(error.message ?? "Ошибка создания тарифного плана");
        return;
      }

      toast.error("Ошибка создания тарифного плана");
    },
  });
}

export function useUpdateBillingPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateBillingPlanRequest }) =>
      apiPatch<{ data: BillingPlanResponse }>(
        API_ROUTES.ADMIN_BILLING_PLAN_BY_ID(id),
        dto,
      ).then((response) => response.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.billing.adminPlans,
      });
      toast.success("Тарифный план обновлён");
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        toast.error(error.message ?? "Ошибка обновления тарифного плана");
        return;
      }

      toast.error("Ошибка обновления тарифного плана");
    },
  });
}

export function useAdjustBalance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: AdminAdjustBalanceRequest) =>
      apiPost<{ success: true }>(API_ROUTES.ADMIN_BILLING_ADJUST, dto),
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({
        queryKey: ["admin", "billing", "transactions"],
      });
      void queryClient.refetchQueries({
        queryKey: ["admin", "billing", "transactions"],
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.billing.balance,
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.userById(vars.userId),
      });
      void queryClient.invalidateQueries({
        queryKey: ["admin", "users"],
      });
      void queryClient.refetchQueries({
        queryKey: ["admin", "users"],
      });

      const direction = vars.amount > 0 ? "начислено" : "списано";
      const absAmount = Math.abs(vars.amount);
      toast.success(`${absAmount} токенов ${direction}`);
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        toast.error(error.message ?? "Ошибка корректировки баланса");
      }
    },
  });
}
