"use client";

import { useEffect, useMemo } from "react";
import { Loader2, X } from "lucide-react";
import { GenerationStatus, OrderStatus } from "@/lib/api/contract";
import { useOrderById } from "@/lib/hooks/generations/useGenerations";
import { Button } from "@/components/ui/button";

interface OrderWatcherProps {
  orderId: string;
  onClose: () => void;
  onComplete: (orderId: string) => void;
}

const TERMINAL_STATUSES = new Set<OrderStatus>([
  OrderStatus.COMPLETED,
  OrderStatus.FAILED,
  OrderStatus.CANCELLED,
]);

const GENERATION_STATUS_LABELS: Record<GenerationStatus, string> = {
  [GenerationStatus.CREATED]: "Создано",
  [GenerationStatus.QUEUED]: "В очереди",
  [GenerationStatus.PROCESSING]: "Генерация",
  [GenerationStatus.RETRYING]: "Повтор",
  [GenerationStatus.COMPLETED]: "Готово",
  [GenerationStatus.FAILED]: "Ошибка",
  [GenerationStatus.REFUNDED]: "Возврат",
  [GenerationStatus.CANCELLED]: "Отменено",
};

export function OrderWatcher({
  orderId,
  onClose,
  onComplete,
}: OrderWatcherProps) {
  const orderQuery = useOrderById(orderId);

  const generations = orderQuery.data?.generations ?? [];
  const orderStatus = orderQuery.data?.status ?? null;

  useEffect(() => {
    if (!orderStatus || !TERMINAL_STATUSES.has(orderStatus)) {
      return;
    }

    onComplete(orderId);
  }, [onComplete, orderId, orderStatus]);

  const title = useMemo(() => {
    if (orderStatus === OrderStatus.COMPLETED) {
      return "Готово";
    }

    if (orderStatus === OrderStatus.FAILED) {
      return "Генерация завершилась с ошибкой";
    }

    if (orderStatus === OrderStatus.CANCELLED) {
      return "Генерация отменена";
    }

    return "Создаём ваши изображения";
  }, [orderStatus]);

  return (
    <div className="fixed inset-0 z-50 flex bg-[--color-background]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-full w-full max-w-4xl flex-col px-4 py-4 md:px-6 md:py-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-[--color-foreground] md:text-2xl">
              {title}
            </p>
            <p className="mt-1 text-xs text-[--color-foreground-muted]">
              Заказ #{orderId.slice(0, 8)}
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Закрыть наблюдение"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-4 md:p-5">
          {orderQuery.isLoading && generations.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-[--color-foreground-muted]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Загружаем данные заказа...
            </div>
          ) : (
            <div className="space-y-3">
              {generations.map((generation, index) => (
                <div
                  key={generation.id}
                  className="rounded-[--radius-md] border border-[--color-border] bg-[--color-background] p-3"
                >
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="text-[--color-foreground]">
                      Изображение {index + 1}
                    </span>
                    <span className="text-[--color-foreground-muted]">
                      {GENERATION_STATUS_LABELS[generation.status]}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-[--color-border]">
                    <div
                      className="h-full rounded-full bg-[--color-primary] transition-all"
                      style={{
                        width: `${Math.max(0, Math.min(100, generation.progress ?? 0))}%`,
                      }}
                    />
                  </div>

                  <p className="mt-1 text-right text-[11px] text-[--color-foreground-muted]">
                    {Math.max(0, Math.min(100, generation.progress ?? 0))}%
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
