"use client";

import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Check,
  EyeOff,
  GalleryVerticalEnd,
  ImageIcon,
  Loader2,
  X,
} from "lucide-react";
import { DataTable } from "@/components/admin/common/DataTable";
import { PageHeader } from "@/components/admin/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GalleryStatus,
  type GalleryItemResponse,
  type PaginationMeta,
} from "@/lib/api/contract";
import {
  useAdminGallery,
  useUpdateGalleryStatus,
} from "@/lib/hooks/gallery/useAdminGallery";
import { cn } from "@/lib/utils";

interface GalleryClientProps {
  initialData: GalleryItemResponse[];
  initialMeta: PaginationMeta;
}

const statusConfig: Record<
  GalleryStatus,
  { label: string; className: string }
> = {
  [GalleryStatus.PENDING]: {
    label: "На модерации",
    className:
      "bg-[--color-warning]/10 text-[--color-warning] border-[--color-warning]/20",
  },
  [GalleryStatus.APPROVED]: {
    label: "Одобрено",
    className:
      "bg-[--color-success]/10 text-[--color-success] border-[--color-success]/20",
  },
  [GalleryStatus.REJECTED]: {
    label: "Отклонено",
    className:
      "bg-[--color-danger]/10 text-[--color-danger] border-[--color-danger]/20",
  },
  [GalleryStatus.HIDDEN]: {
    label: "Скрыто",
    className:
      "bg-white/5 text-[--color-foreground-muted] border-[--color-border]",
  },
};

function GalleryStatusBadge({ status }: { status: GalleryStatus }) {
  const config = statusConfig[status];

  return (
    <Badge className={cn("border", config.className)}>{config.label}</Badge>
  );
}

function GalleryPreview({ imageUrl }: { imageUrl: string }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="flex h-16 w-16 items-center justify-center rounded-[--radius-sm] border border-[--color-border] bg-[--color-surface] text-[--color-foreground-muted]">
        <ImageIcon className="h-4 w-4" />
      </div>
    );
  }

  return (
    <Image
      src={imageUrl}
      alt="Gallery preview"
      width={64}
      height={64}
      className="rounded-[--radius-sm] object-cover"
      onError={() => setHasError(true)}
    />
  );
}

export function GalleryClient({
  initialData,
  initialMeta,
}: GalleryClientProps) {
  const [status, setStatus] = useState<GalleryStatus | undefined>(
    GalleryStatus.PENDING,
  );
  const [page, setPage] = useState(1);
  const [pendingRowId, setPendingRowId] = useState<string | null>(null);

  const galleryQuery = useAdminGallery(
    {
      status,
      page,
      pageSize: 20,
    },
    page === 1 && status === GalleryStatus.PENDING
      ? { data: initialData, meta: initialMeta }
      : undefined,
  );

  const updateStatusMutation = useUpdateGalleryStatus();

  const rows = galleryQuery.data?.data ?? [];
  const meta = galleryQuery.data?.meta ?? initialMeta;

  const changeStatus = useCallback(
    async (id: string, nextStatus: GalleryStatus): Promise<void> => {
      setPendingRowId(id);

      try {
        await updateStatusMutation.mutateAsync({ id, status: nextStatus });
      } finally {
        setPendingRowId(null);
      }
    },
    [updateStatusMutation],
  );

  const columns = useMemo<Array<ColumnDef<GalleryItemResponse>>>(
    () => [
      {
        id: "preview",
        header: "Превью",
        meta: { className: "w-[80px]" },
        cell: ({ row }) => <GalleryPreview imageUrl={row.original.imageUrl} />,
      },
      {
        id: "image",
        header: "Изображение",
        cell: ({ row }) => (
          <div className="min-w-0 max-w-105">
            {row.original.title ? (
              <p className="truncate font-medium">{row.original.title}</p>
            ) : null}
            <p className="truncate text-xs text-[--color-foreground-muted]">
              {row.original.imageUrl}
            </p>
          </div>
        ),
      },
      {
        id: "author",
        header: "Автор",
        meta: { className: "w-[120px]" },
        cell: ({ row }) => (
          <span className="text-sm text-[--color-foreground-muted]">
            {`${row.original.userId.slice(0, 8)}…`}
          </span>
        ),
      },
      {
        id: "status",
        header: "Статус",
        meta: { className: "w-[130px]" },
        cell: ({ row }) => <GalleryStatusBadge status={row.original.status} />,
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
        meta: { className: "w-[200px]" },
        cell: ({ row }) => {
          const item = row.original;
          const isBusy = pendingRowId === item.id;

          return (
            <div className="flex flex-wrap items-center gap-1">
              {(item.status === GalleryStatus.PENDING ||
                item.status === GalleryStatus.REJECTED ||
                item.status === GalleryStatus.HIDDEN) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:text-[--color-success] hover:border-[--color-success]/40"
                  disabled={isBusy}
                  onClick={() =>
                    void changeStatus(item.id, GalleryStatus.APPROVED)
                  }
                >
                  {isBusy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 text-[--color-success]" />
                  )}
                  Одобрить
                </Button>
              )}

              {(item.status === GalleryStatus.PENDING ||
                item.status === GalleryStatus.APPROVED ||
                item.status === GalleryStatus.HIDDEN) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:text-[--color-danger] hover:border-[--color-danger]/40"
                  disabled={isBusy}
                  onClick={() =>
                    void changeStatus(item.id, GalleryStatus.REJECTED)
                  }
                >
                  {isBusy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4 text-[--color-danger]" />
                  )}
                  Отклонить
                </Button>
              )}

              {(item.status === GalleryStatus.APPROVED ||
                item.status === GalleryStatus.REJECTED) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:text-[--color-foreground]"
                  disabled={isBusy}
                  onClick={() =>
                    void changeStatus(item.id, GalleryStatus.HIDDEN)
                  }
                >
                  {isBusy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-[--color-foreground-muted]" />
                  )}
                  Скрыть
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [changeStatus, pendingRowId],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Галерея"
        description="Модерация пользовательских публикаций"
        action={
          <span className="text-sm text-[--color-foreground-muted]">
            Всего: {meta.total}
          </span>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={status === undefined ? "default" : "outline"}
          onClick={() => {
            setStatus(undefined);
            setPage(1);
          }}
        >
          Все
        </Button>
        <Button
          variant={status === GalleryStatus.PENDING ? "default" : "outline"}
          onClick={() => {
            setStatus(GalleryStatus.PENDING);
            setPage(1);
          }}
        >
          На модерации
        </Button>
        <Button
          variant={status === GalleryStatus.APPROVED ? "default" : "outline"}
          onClick={() => {
            setStatus(GalleryStatus.APPROVED);
            setPage(1);
          }}
        >
          Одобренные
        </Button>
        <Button
          variant={status === GalleryStatus.REJECTED ? "default" : "outline"}
          onClick={() => {
            setStatus(GalleryStatus.REJECTED);
            setPage(1);
          }}
        >
          Отклонённые
        </Button>
        <Button
          variant={status === GalleryStatus.HIDDEN ? "default" : "outline"}
          onClick={() => {
            setStatus(GalleryStatus.HIDDEN);
            setPage(1);
          }}
        >
          Скрытые
        </Button>
      </div>

      {!galleryQuery.isLoading && rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <GalleryVerticalEnd className="h-10 w-10 text-[--color-foreground-muted]" />
          <p className="text-[--color-foreground-muted]">
            {status === GalleryStatus.PENDING
              ? "Нет работ на модерации"
              : "Нет работ в этом разделе"}
          </p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          isLoading={galleryQuery.isLoading}
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
