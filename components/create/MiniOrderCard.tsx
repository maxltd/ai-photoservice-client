import Link from "next/link";
import { Clock3, Sparkles } from "lucide-react";
import {
  OrderStatus,
  OrderSourceType,
  type GenerationOrderListItemResponse,
} from "@/lib/api/contract";

interface MiniOrderCardProps {
  order: GenerationOrderListItemResponse;
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "Ожидает",
  [OrderStatus.PROCESSING]: "В обработке",
  [OrderStatus.COMPLETED]: "Завершён",
  [OrderStatus.FAILED]: "Ошибка",
  [OrderStatus.CANCELLED]: "Отменён",
};

export function MiniOrderCard({ order }: MiniOrderCardProps) {
  const sourceLabel =
    order.sourceType === OrderSourceType.PRESET ? "Пресет" : "Фотосессия";

  return (
    <Link
      href={`/app/gallery/${order.id}`}
      className="group flex w-[156px] shrink-0 flex-col gap-2 rounded-[--radius-md] border border-[--color-border] bg-[--color-surface] p-2.5 transition hover:border-white/20"
    >
      <div className="flex h-20 items-center justify-center rounded-[--radius-sm] border border-white/5 bg-black/30 text-[--color-foreground-muted]">
        <Sparkles className="h-5 w-5" />
      </div>

      <div className="space-y-1">
        <p className="text-xs font-medium text-[--color-foreground]">{sourceLabel}</p>
        <p className="text-[11px] text-[--color-foreground-muted]">
          {STATUS_LABELS[order.status]}
        </p>
      </div>

      <div className="mt-auto flex items-center gap-1 text-[10px] text-[--color-foreground-muted]">
        <Clock3 className="h-3 w-3" />
        {new Date(order.createdAt).toLocaleDateString("ru")}
      </div>
    </Link>
  );
}
