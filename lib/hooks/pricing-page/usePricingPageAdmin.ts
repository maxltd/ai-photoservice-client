"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiGet, apiPatch } from "@/lib/api/client";
import {
  API_ROUTES,
  type PricingPageSettingsResponse,
  type UpdatePricingPageSettingsRequest,
} from "@/lib/api/contract";
import { queryKeys } from "@/lib/query/keys";

export function useAdminPricingPage() {
  return useQuery({
    queryKey: queryKeys.pricingPage.admin,
    queryFn: () => apiGet<PricingPageSettingsResponse>(API_ROUTES.ADMIN_PRICING_PAGE),
  });
}

export function useUpdateAdminPricingPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdatePricingPageSettingsRequest) =>
      apiPatch<PricingPageSettingsResponse>(API_ROUTES.ADMIN_PRICING_PAGE, payload),
    onSuccess: (settings) => {
      queryClient.setQueryData(queryKeys.pricingPage.admin, settings);
      toast.success("Настройки страницы цен обновлены");
    },
  });
}
