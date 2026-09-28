"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { queryKeys } from "@/lib/query/keys";
import {
  useMarkAllRead,
  useMarkRead,
  useNotifications,
  useNotificationsSse,
} from "@/lib/hooks/notifications/useNotifications";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function NotificationBell() {
  const queryClient = useQueryClient();
  const notificationsQuery = useNotifications({ pageSize: 10 });
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  const handleIncomingNotification = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: queryKeys.notifications.all,
    });
  }, [queryClient]);

  useNotificationsSse(handleIncomingNotification);

  const notifications = notificationsQuery.data?.data ?? [];
  const unreadCount = notifications.filter((item) => !item.isRead).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 md:h-9 md:w-9"
          aria-label="Уведомления"
        >
          <Bell className="h-4 w-4 md:h-5 md:w-5" />
          {unreadCount > 0 ? (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[--color-primary]" />
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 max-w-[calc(100vw-2rem)]"
      >
        <div className="flex items-center justify-between px-2 py-1.5">
          <p className="text-sm font-medium text-foreground">Уведомления</p>
          <Button
            variant="ghost"
            className="h-7 px-2 text-xs"
            onClick={() => {
              void markAllRead.mutateAsync();
            }}
            disabled={unreadCount === 0 || markAllRead.isPending}
          >
            Прочитать все
          </Button>
        </div>

        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="px-2 py-4 text-sm text-[--color-foreground-muted]">
            Пока нет уведомлений
          </div>
        ) : (
          notifications.map((item) => (
            <DropdownMenuItem
              key={item.id}
              className={cn(
                "flex flex-col items-start gap-1 px-2 py-2",
                !item.isRead && "bg-white/5",
              )}
              onSelect={() => {
                if (!item.isRead) {
                  void markRead.mutateAsync(item.id);
                }
              }}
            >
              <p className="text-sm font-medium text-foreground">
                {item.title}
              </p>
              <p className="line-clamp-2 text-xs text-[--color-foreground-muted]">
                {item.body}
              </p>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
