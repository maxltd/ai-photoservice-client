"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  API_ROUTES,
  type CreatePhotoSessionRequest,
  type PaginatedResponse,
  type PhotoSessionListItemResponse,
  type PhotoSessionResponse,
  type ReorderRequest,
  type UpdatePhotoSessionRequest,
} from "@/lib/api/contract";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";

interface ApiData<TData> {
  data: TData;
}

export interface PhotoSessionListWithStats extends PhotoSessionListItemResponse {
  slotsCount: number;
}

function unwrapList(
  payload:
    | PaginatedResponse<PhotoSessionListItemResponse>
    | ApiData<PaginatedResponse<PhotoSessionListItemResponse>>,
): PaginatedResponse<PhotoSessionListItemResponse> {
  if ("meta" in payload && Array.isArray(payload.data)) {
    return payload;
  }

  return (payload as ApiData<PaginatedResponse<PhotoSessionListItemResponse>>)
    .data;
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

async function enrichSlotsCount(
  sessions: PhotoSessionListItemResponse[],
): Promise<PhotoSessionListWithStats[]> {
  const details = await Promise.all(
    sessions.map((session) =>
      apiGet<PhotoSessionResponse | ApiData<PhotoSessionResponse>>(
        API_ROUTES.ADMIN_PHOTO_SESSION_BY_ID(session.id),
      )
        .then((payload) => unwrapItem(payload))
        .then((detail) => ({ id: session.id, slotsCount: detail.slots.length }))
        .catch(() => ({ id: session.id, slotsCount: 0 })),
    ),
  );

  const map = new Map(details.map((item) => [item.id, item.slotsCount]));

  return sessions.map((session) => ({
    ...session,
    slotsCount: map.get(session.id) ?? 0,
  }));
}

export function usePhotoSessions(initialData?: PhotoSessionListWithStats[]) {
  return useQuery({
    queryKey: queryKeys.sessions.list({}),
    queryFn: async () => {
      const response = await apiGet<
        | PaginatedResponse<PhotoSessionListItemResponse>
        | ApiData<PaginatedResponse<PhotoSessionListItemResponse>>
      >(API_ROUTES.ADMIN_PHOTO_SESSIONS, { pageSize: 100 });

      const list = unwrapList(response).data;
      return enrichSlotsCount(list);
    },
    initialData,
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function usePhotoSessionByIdAdmin(
  id: string,
  initialData?: PhotoSessionResponse,
) {
  return useQuery({
    queryKey: queryKeys.sessions.byId(id),
    queryFn: async () => {
      const response = await apiGet<
        PhotoSessionResponse | ApiData<PhotoSessionResponse>
      >(API_ROUTES.ADMIN_PHOTO_SESSION_BY_ID(id));
      return unwrapItem(response);
    },
    enabled: Boolean(id),
    initialData,
  });
}

export function useCreatePhotoSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePhotoSessionRequest) => {
      const response = await apiPost<
        PhotoSessionResponse | ApiData<PhotoSessionResponse>,
        CreatePhotoSessionRequest
      >(API_ROUTES.PHOTO_SESSIONS, payload);
      return unwrapItem(response);
    },
    onSuccess: () => {
      toast.success("Фотосессия создана");
      void queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Произошла ошибка";
      toast.error(message);
    },
  });
}

export function useUpdatePhotoSession(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdatePhotoSessionRequest) => {
      const response = await apiPatch<
        PhotoSessionResponse | ApiData<PhotoSessionResponse>,
        UpdatePhotoSessionRequest
      >(API_ROUTES.PHOTO_SESSION_BY_ID(id), payload);
      return unwrapItem(response);
    },
    onSuccess: () => {
      toast.success("Фотосессия обновлена");
      void queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Произошла ошибка";
      toast.error(message);
    },
  });
}

export function useDeletePhotoSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiDelete(API_ROUTES.PHOTO_SESSION_BY_ID(id));
    },
    onSuccess: () => {
      toast.success("Фотосессия удалена");
      void queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Произошла ошибка";
      toast.error(message);
    },
  });
}

export function useReorderPhotoSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ReorderRequest) => {
      await apiPatch<void, ReorderRequest>(
        API_ROUTES.PHOTO_SESSIONS_REORDER,
        payload,
      );
      return payload;
    },
    onMutate: async (newOrder) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.sessions.all });

      const previousEntries = queryClient.getQueriesData<
        PhotoSessionListWithStats[]
      >({
        queryKey: queryKeys.sessions.all,
      });

      for (const [key, value] of previousEntries) {
        if (!value) {
          continue;
        }

        const map = new Map(
          newOrder.items.map((item) => [item.id, item.sortOrder]),
        );

        queryClient.setQueryData(
          key,
          value.map((session) => {
            const nextOrder = map.get(session.id);
            return nextOrder === undefined
              ? session
              : { ...session, sortOrder: nextOrder };
          }),
        );
      }

      return { previousEntries };
    },
    onError: (_error, _variables, context) => {
      context?.previousEntries.forEach(([key, value]) => {
        queryClient.setQueryData(key, value);
      });
      toast.error("Не удалось сохранить порядок");
    },
    onSuccess: () => {
      toast.success("Порядок фотосессий сохранён");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
    },
  });
}
