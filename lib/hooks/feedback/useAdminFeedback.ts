"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiGet, apiPatch } from "@/lib/api/client";
import {
  API_ROUTES,
  FeedbackStatus,
  type FeedbackResponse,
  type PaginatedResponse,
  type UpdateFeedbackStatusRequest,
} from "@/lib/api/contract";
import { queryKeys } from "@/lib/query/keys";

export function useAdminFeedback(
  params?: {
    page?: number;
    pageSize?: number;
    status?: FeedbackStatus;
  },
  initialData?: PaginatedResponse<FeedbackResponse>,
) {
  return useQuery({
    queryKey: queryKeys.feedback.admin(params ?? {}),
    queryFn: () =>
      apiGet<PaginatedResponse<FeedbackResponse>>(API_ROUTES.ADMIN_FEEDBACK, {
        page: params?.page,
        pageSize: params?.pageSize ?? 20,
        status: params?.status,
      }),
    initialData,
    staleTime: 30_000,
  });
}

export function useUpdateFeedbackStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: FeedbackStatus }) =>
      apiPatch<{ success: true }>(API_ROUTES.ADMIN_FEEDBACK_BY_ID(id), {
        status,
      } satisfies UpdateFeedbackStatusRequest),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.feedback.admin({}) });
      const previous = queryClient.getQueriesData<
        PaginatedResponse<FeedbackResponse>
      >({
        queryKey: queryKeys.feedback.admin({}),
      });

      queryClient.setQueriesData<PaginatedResponse<FeedbackResponse>>(
        { queryKey: queryKeys.feedback.admin({}) },
        (old) => {
          if (!old) {
            return old;
          }

          return {
            ...old,
            data: old.data.map((item) =>
              item.id === id ? { ...item, status } : item,
            ),
          };
        },
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        for (const [key, data] of context.previous) {
          queryClient.setQueryData(key, data);
        }
      }
      toast.error("Не удалось обновить статус");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.feedback.admin({}) });
    },
  });
}
