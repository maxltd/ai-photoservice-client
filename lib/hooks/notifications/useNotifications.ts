"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch } from "@/lib/api/client";
import {
  API_ROUTES,
  type NotificationResponse,
  type PaginatedResponse,
  type SseEvent,
} from "@/lib/api/contract";
import { queryKeys } from "@/lib/query/keys";

interface NotificationsParams {
  page?: number;
  pageSize?: number;
}

interface SseNotificationEvent {
  id: string;
  type: NotificationResponse["type"];
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export function useNotifications(params?: NotificationsParams) {
  const query = params ?? {};

  return useQuery({
    queryKey: queryKeys.notifications.list(query),
    queryFn: () =>
      apiGet<PaginatedResponse<NotificationResponse>>(API_ROUTES.NOTIFICATIONS, {
        page: query.page,
        pageSize: query.pageSize ?? 10,
      }),
  });
}

export function useMarkRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiPatch<{ success: true }>(API_ROUTES.NOTIFICATION_READ(id)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiPatch<{ success: true }>(API_ROUTES.NOTIFICATIONS_READ_ALL),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

export function useNotificationsSse(
  onNotification?: (event: SseEvent<SseNotificationEvent>) => void,
) {
  useEffect(() => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
    const streamUrl = `${apiBaseUrl}${API_ROUTES.SSE_NOTIFICATIONS}`;
    const source = new EventSource(streamUrl, { withCredentials: true });

    const listener = (event: MessageEvent<string>) => {
      try {
        const payload = JSON.parse(event.data) as SseNotificationEvent;
        onNotification?.({
          type: "notification",
          data: payload,
        });
      } catch {
        // ignore malformed payloads
      }
    };

    source.addEventListener("notification", listener as EventListener);

    return () => {
      source.removeEventListener("notification", listener as EventListener);
      source.close();
    };
  }, [onNotification]);
}
