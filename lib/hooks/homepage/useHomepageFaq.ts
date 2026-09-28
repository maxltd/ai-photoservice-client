"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import {
  API_ROUTES,
  type CreateHomepageFaqRequest,
  type HomepageFaqResponse,
  type ReorderHomepageFaqRequest,
  type UpdateHomepageFaqRequest,
} from "@/lib/api/contract";
import { queryKeys } from "@/lib/query/keys";

type FaqResponse = { data: HomepageFaqResponse[] };

export function useHomepageFaq(initialData?: FaqResponse) {
  return useQuery({
    queryKey: queryKeys.homepageFaq.public,
    queryFn: () => apiGet<FaqResponse>(API_ROUTES.HOMEPAGE_FAQ),
    initialData,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminHomepageFaq(initialData?: FaqResponse) {
  return useQuery({
    queryKey: queryKeys.homepageFaq.admin,
    queryFn: () => apiGet<FaqResponse>(API_ROUTES.ADMIN_HOMEPAGE_FAQ),
    initialData,
    staleTime: 30_000,
  });
}

function invalidateFaq(queryClient: ReturnType<typeof useQueryClient>): void {
  void queryClient.invalidateQueries({ queryKey: queryKeys.homepageFaq.public });
  void queryClient.invalidateQueries({ queryKey: queryKeys.homepageFaq.admin });
}

export function useSaveHomepageFaq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id?: string; body: CreateHomepageFaqRequest | UpdateHomepageFaqRequest }) =>
      id
        ? apiPatch<HomepageFaqResponse>(API_ROUTES.ADMIN_HOMEPAGE_FAQ_BY_ID(id), body)
        : apiPost<HomepageFaqResponse>(API_ROUTES.ADMIN_HOMEPAGE_FAQ, body),
    onSuccess: () => {
      invalidateFaq(queryClient);
      toast.success("FAQ сохранён");
    },
    onError: () => toast.error("Не удалось сохранить FAQ"),
  });
}

export function useDeleteHomepageFaq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(API_ROUTES.ADMIN_HOMEPAGE_FAQ_BY_ID(id)),
    onSuccess: () => {
      invalidateFaq(queryClient);
      toast.success("FAQ удалён");
    },
    onError: () => toast.error("Не удалось удалить FAQ"),
  });
}

export function useReorderHomepageFaq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ReorderHomepageFaqRequest) => apiPatch<FaqResponse>(API_ROUTES.ADMIN_HOMEPAGE_FAQ_REORDER, body),
    onSuccess: (response) => {
      queryClient.setQueryData(queryKeys.homepageFaq.admin, response);
      void queryClient.invalidateQueries({ queryKey: queryKeys.homepageFaq.public });
    },
    onError: () => toast.error("Не удалось изменить порядок FAQ"),
  });
}
