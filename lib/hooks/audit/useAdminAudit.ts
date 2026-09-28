"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/client";
import {
  API_ROUTES,
  type AuditAction,
  type AuditLogResponse,
  type PaginatedResponse,
} from "@/lib/api/contract";
import { queryKeys } from "@/lib/query/keys";

interface AdminAuditParams {
  page?: number;
  pageSize?: number;
  entityType?: string;
  action?: AuditAction;
  userId?: string;
}

export function useAdminAudit(
  params?: AdminAuditParams,
  initialData?: PaginatedResponse<AuditLogResponse>,
) {
  return useQuery({
    queryKey: queryKeys.admin.audit(params ?? {}),
    queryFn: () =>
      apiGet<PaginatedResponse<AuditLogResponse>>(API_ROUTES.ADMIN_AUDIT, {
        page: params?.page,
        pageSize: params?.pageSize ?? 25,
        entityType: params?.entityType || undefined,
        action: params?.action,
        userId: params?.userId || undefined,
      }),
    initialData,
    staleTime: 60_000,
  });
}
