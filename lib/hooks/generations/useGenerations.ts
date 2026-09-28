"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/client";
import {
  API_ROUTES,
  GenerationStatus,
  OrderStatus,
  type GenerationOrderResponse,
  type GenerationResponse,
  type GenerationOrderListItemDto,
  type PaginatedResponse,
  type SseGenerationErrorEvent,
  type SseGenerationProgressEvent,
  type SseGenerationResultEvent,
  type SseGenerationStatusEvent,
  type SseOrderStatusEvent,
} from "@/lib/api/contract";
import { queryKeys } from "@/lib/query/keys";

export type { GenerationOrderResponse, GenerationResponse };

interface UseMyOrdersParams {
  status?: OrderStatus;
  page?: number;
  pageSize?: number;
}

export function useMyOrders(
  params?: UseMyOrdersParams,
  initialData?: PaginatedResponse<GenerationOrderListItemDto>,
) {
  return useQuery({
    queryKey: queryKeys.generations.list(params ?? {}),
    queryFn: () =>
      apiGet<PaginatedResponse<GenerationOrderListItemDto>>(
        API_ROUTES.GENERATIONS,
        {
          status: params?.status,
          page: params?.page,
          pageSize: params?.pageSize ?? 20,
        },
      ),
    initialData,
    staleTime: 5_000,
  });
}

export function useOrderById(orderId: string) {
  return useQuery({
    queryKey: queryKeys.generations.byId(orderId),
    queryFn: () =>
      apiGet<{ data: GenerationOrderResponse }>(
        API_ROUTES.GENERATION_BY_ID(orderId),
      ).then((response) => response.data),
    enabled: !!orderId,
    staleTime: 0,
  });
}

function isTerminalOrderStatus(status: OrderStatus): boolean {
  return (
    status === OrderStatus.COMPLETED ||
    status === OrderStatus.FAILED ||
    status === OrderStatus.CANCELLED
  );
}

function parseSseEvent<T>(event: Event): T | null {
  if (!(event instanceof MessageEvent)) {
    return null;
  }

  try {
    return JSON.parse(event.data) as T;
  } catch {
    return null;
  }
}

export function useMyOrdersSse(): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
    const source = new EventSource(`${apiBaseUrl}${API_ROUTES.SSE_ORDERS}`, {
      withCredentials: true,
    });

    const generationStatusListener = (event: Event) => {
      const payload = parseSseEvent<SseGenerationStatusEvent>(event);
      if (!payload) {
        return;
      }

      queryClient.setQueryData<GenerationOrderResponse>(
        queryKeys.generations.byId(payload.orderId),
        (current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            generations: current.generations.map((generation) =>
              generation.id === payload.generationId
                ? { ...generation, status: payload.status }
                : generation,
            ),
          };
        },
      );
    };

    const generationProgressListener = (event: Event) => {
      const payload = parseSseEvent<SseGenerationProgressEvent>(event);
      if (!payload) {
        return;
      }

      queryClient.setQueryData<GenerationOrderResponse>(
        queryKeys.generations.byId(payload.orderId),
        (current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            generations: current.generations.map((generation) =>
              generation.id === payload.generationId
                ? { ...generation, progress: payload.progress }
                : generation,
            ),
          };
        },
      );
    };

    const generationResultListener = (event: Event) => {
      const payload = parseSseEvent<SseGenerationResultEvent>(event);
      if (!payload) {
        return;
      }

      queryClient.setQueryData<GenerationOrderResponse>(
        queryKeys.generations.byId(payload.orderId),
        (current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            generations: current.generations.map((generation) =>
              generation.id === payload.generationId
                ? {
                    ...generation,
                    status: GenerationStatus.COMPLETED,
                    progress: 100,
                    ...(payload.imageUrl
                      ? { resultImageUrl: payload.imageUrl }
                      : {}),
                    ...(payload.videoUrl
                      ? { resultVideoUrl: payload.videoUrl }
                      : {}),
                  }
                : generation,
            ),
          };
        },
      );
    };

    const generationErrorListener = (event: Event) => {
      const payload = parseSseEvent<SseGenerationErrorEvent>(event);
      if (!payload) {
        return;
      }

      queryClient.setQueryData<GenerationOrderResponse>(
        queryKeys.generations.byId(payload.orderId),
        (current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            generations: current.generations.map((generation) =>
              generation.id === payload.generationId
                ? { ...generation, status: GenerationStatus.FAILED }
                : generation,
            ),
          };
        },
      );
    };

    const orderStatusListener = (event: Event) => {
      const payload = parseSseEvent<SseOrderStatusEvent>(event);
      if (!payload) {
        return;
      }

      queryClient.setQueriesData<PaginatedResponse<GenerationOrderListItemDto>>(
        { queryKey: ["generations", "list"] },
        (current) => {
          if (!current || !Array.isArray(current.data)) {
            return current;
          }

          return {
            ...current,
            data: current.data.map((order) =>
              order.id === payload.orderId
                ? {
                    ...order,
                    status: payload.status,
                  }
                : order,
            ),
          };
        },
      );

      queryClient.setQueryData<GenerationOrderResponse>(
        queryKeys.generations.byId(payload.orderId),
        (current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            status: payload.status,
          };
        },
      );

      if (isTerminalOrderStatus(payload.status)) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.generations.byId(payload.orderId),
        });
      }
    };

    source.addEventListener("generation_status", generationStatusListener);
    source.addEventListener("generation_progress", generationProgressListener);
    source.addEventListener("generation_result", generationResultListener);
    source.addEventListener("generation_error", generationErrorListener);
    source.addEventListener("order_status", orderStatusListener);

    return () => {
      source.removeEventListener("generation_status", generationStatusListener);
      source.removeEventListener(
        "generation_progress",
        generationProgressListener,
      );
      source.removeEventListener("generation_result", generationResultListener);
      source.removeEventListener("generation_error", generationErrorListener);
      source.removeEventListener("order_status", orderStatusListener);
      source.close();
    };
  }, [queryClient]);
}
