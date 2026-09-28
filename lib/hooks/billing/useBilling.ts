"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiGet, apiPost } from "@/lib/api/client";
import {
  API_ROUTES,
  ApiError,
  type BalanceResponse,
  type BillingPlanResponse,
  type PaginatedResponse,
  type TokenTransactionResponse,
  type TopupRequest,
  type TopupResponse,
} from "@/lib/api/contract";
import { queryKeys } from "@/lib/query/keys";

export function useBalance(initialData?: BalanceResponse) {
  return useQuery({
    queryKey: queryKeys.billing.balance,
    queryFn: () =>
      apiGet<{ data: BalanceResponse }>(API_ROUTES.BILLING_BALANCE).then(
        (response) => response.data,
      ),
    initialData,
    staleTime: 30_000,
  });
}

export function useTransactions(
  page = 1,
  pageSize = 20,
  enabled = true,
  initialData?: PaginatedResponse<TokenTransactionResponse>,
) {
  return useQuery({
    queryKey: queryKeys.billing.transactions({ page, pageSize }),
    queryFn: () =>
      apiGet<PaginatedResponse<TokenTransactionResponse>>(
        API_ROUTES.BILLING_TRANSACTIONS,
        {
          page,
          pageSize,
        },
      ),
    enabled,
    initialData,
    staleTime: 60_000,
  });
}

export function useBillingPlans(initialData?: BillingPlanResponse[]) {
  return useQuery({
    queryKey: queryKeys.billing.plans,
    queryFn: () =>
      apiGet<{ data: BillingPlanResponse[] }>(API_ROUTES.BILLING_PLANS).then(
        (response) => response.data,
      ),
    initialData,
    staleTime: 60_000,
  });
}

export function useTopup() {
  return useMutation({
    mutationFn: (dto: TopupRequest) =>
      apiPost<{ data: TopupResponse }>(API_ROUTES.BILLING_TOPUP, dto).then(
        (response) => response.data,
      ),
    onSuccess: () => {
      toast.info("Перенаправляем на страницу оплаты");
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        toast.error(error.message ?? "Ошибка пополнения");
        return;
      }

      toast.error("Ошибка пополнения");
    },
  });
}
