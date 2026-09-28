"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle, ExternalLink, Shield, XCircle } from "lucide-react";
import { DataTable } from "@/components/admin/common/DataTable";
import { PageHeader } from "@/components/admin/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ReportReason,
  ReportStatus,
  type PaginationMeta,
  type ReportResponse,
} from "@/lib/api/contract";
import {
  useAdminReports,
  useResolveReport,
} from "@/lib/hooks/reports/useAdminReports";
import { cn } from "@/lib/utils";

interface ReportsClientProps {
  initialData: ReportResponse[];
  initialMeta: PaginationMeta;
}

const reasonConfig: Record<ReportReason, { label: string }> = {
  [ReportReason.INAPPROPRIATE]: { label: "Неприемлемо" },
  [ReportReason.COPYRIGHT]: { label: "Авторское право" },
  [ReportReason.SPAM]: { label: "Спам" },
  [ReportReason.OTHER]: { label: "Другое" },
};

const reportStatusConfig: Record<
  ReportStatus,
  { label: string; className: string }
> = {
  [ReportStatus.OPEN]: {
    label: "Открыта",
    className:
      "bg-[--color-warning]/10 text-[--color-warning] border-[--color-warning]/20",
  },
  [ReportStatus.RESOLVED]: {
    label: "Решена",
    className:
      "bg-[--color-success]/10 text-[--color-success] border-[--color-success]/20",
  },
  [ReportStatus.DISMISSED]: {
    label: "Отклонена",
    className:
      "bg-white/5 text-[--color-foreground-muted] border-[--color-border]",
  },
};

function ReasonBadge({ reason }: { reason: ReportReason }) {
  return (
    <Badge className="border border-[--color-border] bg-white/5 text-[--color-foreground-muted]">
      {reasonConfig[reason].label}
    </Badge>
  );
}

function ReportStatusBadge({ status }: { status: ReportStatus }) {
  const cfg = reportStatusConfig[status];
  return <Badge className={cn("border", cfg.className)}>{cfg.label}</Badge>;
}

export function ReportsClient({
  initialData,
  initialMeta,
}: ReportsClientProps) {
  const [status, setStatus] = useState<ReportStatus>(ReportStatus.OPEN);
  const [page, setPage] = useState(1);

  const reportsQuery = useAdminReports(
    {
      status,
      page,
      pageSize: 20,
    },
    page === 1 && status === ReportStatus.OPEN
      ? { data: initialData, meta: initialMeta }
      : undefined,
  );

  const resolveMutation = useResolveReport();

  const rows = reportsQuery.data?.data ?? [];
  const meta = reportsQuery.data?.meta ?? initialMeta;

  const resolve = useCallback(
    async (
      id: string,
      next: ReportStatus.RESOLVED | ReportStatus.DISMISSED,
    ): Promise<void> => {
      await resolveMutation.mutateAsync({ id, status: next });
    },
    [resolveMutation],
  );

  const columns = useMemo<Array<ColumnDef<ReportResponse>>>(
    () => [
      {
        id: "reason",
        header: "Причина",
        cell: ({ row }) => (
          <div className="space-y-1">
            <ReasonBadge reason={row.original.reason} />
            {row.original.comment ? (
              <p className="text-xs text-[--color-foreground-muted]">
                {row.original.comment}
              </p>
            ) : null}
          </div>
        ),
      },
      {
        id: "gallery",
        header: "Галерея",
        meta: { className: "w-[160px]" },
        cell: ({ row }) => (
          <div className="space-y-1">
            <p className="text-sm">{`${row.original.galleryItemId.slice(0, 8)}…`}</p>
            <Link
              href="/admin/gallery"
              className="inline-flex items-center gap-1 text-xs text-[--color-foreground-muted] hover:text-[--color-foreground]"
            >
              <ExternalLink className="h-3 w-3" />
              Открыть
            </Link>
          </div>
        ),
      },
      {
        id: "author",
        header: "Автор",
        meta: { className: "w-[120px]" },
        cell: ({ row }) => (
          <span className="text-sm text-[--color-foreground-muted]">
            {`${row.original.reporterId.slice(0, 8)}…`}
          </span>
        ),
      },
      {
        id: "status",
        header: "Статус",
        meta: { className: "w-[130px]" },
        cell: ({ row }) => <ReportStatusBadge status={row.original.status} />,
      },
      {
        id: "date",
        header: "Дата",
        meta: { className: "w-[120px]" },
        cell: ({ row }) =>
          new Date(row.original.createdAt).toLocaleDateString("ru"),
      },
      {
        id: "actions",
        header: "Действия",
        meta: { className: "w-[160px]" },
        cell: ({ row }) => {
          if (row.original.status !== ReportStatus.OPEN) {
            return null;
          }

          return (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="hover:text-[--color-success] hover:border-[--color-success]/40"
                disabled={resolveMutation.isPending}
                onClick={() =>
                  void resolve(row.original.id, ReportStatus.RESOLVED)
                }
              >
                <CheckCircle className="h-4 w-4 text-[--color-success]" />
                Решить
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="hover:text-[--color-foreground] hover:border-[--color-border]"
                disabled={resolveMutation.isPending}
                onClick={() =>
                  void resolve(row.original.id, ReportStatus.DISMISSED)
                }
              >
                <XCircle className="h-4 w-4 text-[--color-foreground-muted]" />
                Отклонить
              </Button>
            </div>
          );
        },
      },
    ],
    [resolve, resolveMutation.isPending],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Жалобы"
        description="Модерация репортов пользователей"
        action={
          <span className="text-sm text-[--color-foreground-muted]">
            Всего: {meta.total}
          </span>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={status === ReportStatus.OPEN ? "default" : "outline"}
          onClick={() => {
            setStatus(ReportStatus.OPEN);
            setPage(1);
          }}
        >
          Открытые
        </Button>
        <Button
          variant={status === ReportStatus.RESOLVED ? "default" : "outline"}
          onClick={() => {
            setStatus(ReportStatus.RESOLVED);
            setPage(1);
          }}
        >
          Решённые
        </Button>
        <Button
          variant={status === ReportStatus.DISMISSED ? "default" : "outline"}
          onClick={() => {
            setStatus(ReportStatus.DISMISSED);
            setPage(1);
          }}
        >
          Отклонённые
        </Button>
      </div>

      {!reportsQuery.isLoading && rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <Shield className="h-10 w-10 text-[--color-foreground-muted]" />
          <p className="text-[--color-foreground-muted]">
            {status === ReportStatus.OPEN
              ? "Открытых жалоб нет"
              : "Нет жалоб в этом разделе"}
          </p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          isLoading={reportsQuery.isLoading}
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
