"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiGet, apiPatch } from "@/lib/api/client";
import {
  API_ROUTES,
  type PaginatedResponse,
  type ReportResponse,
  ReportStatus,
  type ResolveReportRequest,
} from "@/lib/api/contract";
import { queryKeys } from "@/lib/query/keys";

export function useAdminReports(
  params?: {
    page?: number;
    pageSize?: number;
    status?: ReportStatus;
  },
  initialData?: PaginatedResponse<ReportResponse>,
) {
  return useQuery({
    queryKey: queryKeys.reports.admin(params ?? {}),
    queryFn: () =>
      apiGet<PaginatedResponse<ReportResponse>>(API_ROUTES.ADMIN_REPORTS, {
        page: params?.page,
        pageSize: params?.pageSize ?? 20,
        status: params?.status,
      }),
    initialData,
    staleTime: 30_000,
  });
}

export function useResolveReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: ReportStatus.RESOLVED | ReportStatus.DISMISSED;
    }) =>
      apiPatch<{ success: true }>(API_ROUTES.ADMIN_REPORT_RESOLVE(id), {
        status,
      } satisfies ResolveReportRequest),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.reports.admin({}) });
      const previous = queryClient.getQueriesData<PaginatedResponse<ReportResponse>>({
        queryKey: queryKeys.reports.admin({}),
      });

      queryClient.setQueriesData<PaginatedResponse<ReportResponse>>(
        { queryKey: queryKeys.reports.admin({}) },
        (old) => {
          if (!old) {
            return old;
          }

          return {
            ...old,
            data: old.data.map((report) =>
              report.id === id ? { ...report, status } : report,
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
      toast.error("Не удалось обновить жалобу");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.reports.admin({}) });
    },
  });
}
