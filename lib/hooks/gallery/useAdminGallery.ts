"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiGet, apiPatch } from "@/lib/api/client";
import {
  API_ROUTES,
  ApiError,
  GalleryStatus,
  type GalleryItemResponse,
  type PaginatedResponse,
  type UpdateGalleryStatusRequest,
} from "@/lib/api/contract";
import { queryKeys } from "@/lib/query/keys";

export function useAdminGallery(
  params?: {
    page?: number;
    pageSize?: number;
    status?: GalleryStatus;
  },
  initialData?: PaginatedResponse<GalleryItemResponse>,
) {
  return useQuery({
    queryKey: queryKeys.gallery.admin(params ?? {}),
    queryFn: () =>
      apiGet<PaginatedResponse<GalleryItemResponse>>(API_ROUTES.ADMIN_GALLERY, {
        page: params?.page,
        pageSize: params?.pageSize ?? 20,
        status: params?.status,
      }),
    initialData,
    staleTime: 30_000,
  });
}

export function useUpdateGalleryStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: GalleryStatus }) =>
      apiPatch<{ success: true }>(API_ROUTES.ADMIN_GALLERY_STATUS(id), {
        status,
      } satisfies UpdateGalleryStatusRequest),
    onMutate: async ({ id, status }) => {
      const adminGalleryQueryKey = ["admin", "gallery"] as const;

      await queryClient.cancelQueries({ queryKey: adminGalleryQueryKey });
      const previousData = queryClient.getQueriesData<
        PaginatedResponse<GalleryItemResponse>
      >({
        queryKey: adminGalleryQueryKey,
      });

      queryClient.setQueriesData<PaginatedResponse<GalleryItemResponse>>(
        { queryKey: adminGalleryQueryKey },
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

      return { previousData };
    },
    onError: (error, _vars, context) => {
      if (context?.previousData) {
        for (const [queryKey, data] of context.previousData) {
          queryClient.setQueryData(queryKey, data);
        }
      }

      if (error instanceof ApiError) {
        toast.error(error.message || "Не удалось изменить статус");
        return;
      }

      toast.error("Не удалось изменить статус");
    },
    onSettled: () => {
      const adminGalleryQueryKey = ["admin", "gallery"] as const;
      void queryClient.invalidateQueries({ queryKey: adminGalleryQueryKey });
      void queryClient.refetchQueries({ queryKey: adminGalleryQueryKey });
    },
  });
}
