"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { LifeBuoy } from "lucide-react";
import { DataTable } from "@/components/admin/common/DataTable";
import { PageHeader } from "@/components/admin/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  FeedbackStatus,
  type FeedbackResponse,
  type PaginationMeta,
} from "@/lib/api/contract";
import {
  useAdminFeedback,
  useUpdateFeedbackStatus,
} from "@/lib/hooks/feedback/useAdminFeedback";
import { cn } from "@/lib/utils";

interface FeedbackClientProps {
  initialData: FeedbackResponse[];
  initialMeta: PaginationMeta;
}

const feedbackStatusConfig: Record<
  FeedbackStatus,
  { label: string; className: string }
> = {
  [FeedbackStatus.NEW]: {
    label: "Новое",
    className:
      "bg-[--color-secondary]/10 text-[--color-secondary] border-[--color-secondary]/20",
  },
  [FeedbackStatus.IN_PROGRESS]: {
    label: "В работе",
    className:
      "bg-[--color-warning]/10 text-[--color-warning] border-[--color-warning]/20",
  },
  [FeedbackStatus.RESOLVED]: {
    label: "Решено",
    className:
      "bg-[--color-success]/10 text-[--color-success] border-[--color-success]/20",
  },
};

function FeedbackStatusBadge({ status }: { status: FeedbackStatus }) {
  const cfg = feedbackStatusConfig[status];
  return <Badge className={cn("border", cfg.className)}>{cfg.label}</Badge>;
}

export function FeedbackClient({
  initialData,
  initialMeta,
}: FeedbackClientProps) {
  const [status, setStatus] = useState<FeedbackStatus>(FeedbackStatus.NEW);
  const [page, setPage] = useState(1);

  const feedbackQuery = useAdminFeedback(
    {
      status,
      page,
      pageSize: 20,
    },
    page === 1 && status === FeedbackStatus.NEW
      ? { data: initialData, meta: initialMeta }
      : undefined,
  );

  const updateStatus = useUpdateFeedbackStatus();

  const rows = feedbackQuery.data?.data ?? [];
  const meta = feedbackQuery.data?.meta ?? initialMeta;

  const columns = useMemo<Array<ColumnDef<FeedbackResponse>>>(
    () => [
      {
        id: "text",
        header: "Сообщение",
        cell: ({ row }) => (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="block max-w-75 cursor-help truncate text-sm">
                {row.original.text.slice(0, 120)}
                {row.original.text.length > 120 ? "…" : ""}
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-100 whitespace-pre-wrap">
              {row.original.text}
            </TooltipContent>
          </Tooltip>
        ),
      },
      {
        id: "email",
        header: "Email",
        meta: { className: "w-[200px]" },
        cell: ({ row }) => (
          <span className="text-sm text-[--color-foreground-muted]">
            {row.original.email ?? "—"}
          </span>
        ),
      },
      {
        id: "status",
        header: "Статус",
        meta: { className: "w-[200px]" },
        cell: ({ row }) => (
          <div className="flex flex-col gap-2">
            <FeedbackStatusBadge status={row.original.status} />
            <Select
              value={row.original.status}
              onValueChange={(value) => {
                void updateStatus.mutateAsync({
                  id: row.original.id,
                  status: value as FeedbackStatus,
                });
              }}
              disabled={updateStatus.isPending}
            >
              <SelectTrigger className="h-7 w-35 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={FeedbackStatus.NEW}>Новое</SelectItem>
                <SelectItem value={FeedbackStatus.IN_PROGRESS}>
                  В работе
                </SelectItem>
                <SelectItem value={FeedbackStatus.RESOLVED}>Решено</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ),
      },
      {
        id: "date",
        header: "Дата",
        meta: { className: "w-[120px]" },
        cell: ({ row }) =>
          new Date(row.original.createdAt).toLocaleDateString("ru"),
      },
    ],
    [updateStatus],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Обратная связь"
        description="Сообщения от пользователей"
        action={
          <span className="text-sm text-[--color-foreground-muted]">
            Всего: {meta.total}
          </span>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={status === FeedbackStatus.NEW ? "default" : "outline"}
          onClick={() => {
            setStatus(FeedbackStatus.NEW);
            setPage(1);
          }}
        >
          Новые
        </Button>
        <Button
          variant={
            status === FeedbackStatus.IN_PROGRESS ? "default" : "outline"
          }
          onClick={() => {
            setStatus(FeedbackStatus.IN_PROGRESS);
            setPage(1);
          }}
        >
          В работе
        </Button>
        <Button
          variant={status === FeedbackStatus.RESOLVED ? "default" : "outline"}
          onClick={() => {
            setStatus(FeedbackStatus.RESOLVED);
            setPage(1);
          }}
        >
          Решённые
        </Button>
      </div>

      {!feedbackQuery.isLoading && rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <LifeBuoy className="h-10 w-10 text-[--color-foreground-muted]" />
          <p className="text-[--color-foreground-muted]">
            {status === FeedbackStatus.NEW
              ? "Новых сообщений нет"
              : "Нет сообщений в этом разделе"}
          </p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          isLoading={feedbackQuery.isLoading}
        />
      )}

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-[--color-foreground-muted]">
          Всего: {meta.total}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={meta.page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Предыдущая
          </Button>
          <span className="text-sm text-[--color-foreground-muted]">
            {meta.page} / {Math.max(meta.totalPages, 1)}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={meta.page >= Math.max(meta.totalPages, 1)}
            onClick={() => setPage((p) => p + 1)}
          >
            Следующая
          </Button>
        </div>
      </div>
    </div>
  );
}
