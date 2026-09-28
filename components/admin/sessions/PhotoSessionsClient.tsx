"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { type CategoryResponse } from "@/lib/api/contract";
import {
  useDeletePhotoSession,
  usePhotoSessions,
  useReorderPhotoSessions,
  type PhotoSessionListWithStats,
} from "@/lib/hooks/sessions/usePhotoSessions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/admin/common/ConfirmDialog";
import { DataTable } from "@/components/admin/common/DataTable";
import { PageHeader } from "@/components/admin/common/PageHeader";
import { SortableList } from "@/components/admin/common/SortableList";
import { StatusBadge } from "@/components/admin/common/StatusBadge";

interface PhotoSessionsClientProps {
  initialData: PhotoSessionListWithStats[];
  categories: CategoryResponse[];
}

type ViewMode = "table" | "reorder";

export function PhotoSessionsClient({
  initialData,
  categories,
}: PhotoSessionsClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [searchValue, setSearchValue] = useState("");
  const [deleteTarget, setDeleteTarget] =
    useState<PhotoSessionListWithStats | null>(null);
  const [pendingOrder, setPendingOrder] = useState<Array<{
    id: string;
    sortOrder: number;
  }> | null>(null);

  const sessionsQuery = usePhotoSessions(initialData);
  const deleteMutation = useDeletePhotoSession();
  const reorderMutation = useReorderPhotoSessions();
  const refetchSessions = sessionsQuery.refetch;

  useEffect(() => {
    void refetchSessions();
  }, [refetchSessions]);

  const sessions = useMemo(
    () => sessionsQuery.data ?? [],
    [sessionsQuery.data],
  );

  const filtered = useMemo(() => {
    const normalized = searchValue.trim().toLowerCase();
    if (!normalized) {
      return sessions;
    }

    return sessions.filter((session) =>
      session.title.toLowerCase().includes(normalized),
    );
  }, [searchValue, sessions]);

  const categoryNameMap = useMemo(() => {
    return new Map(categories.map((category) => [category.id, category.name]));
  }, [categories]);

  const columns = useMemo<Array<ColumnDef<PhotoSessionListWithStats>>>(
    () => [
      {
        id: "preview",
        header: "Превью",
        meta: { mobileHidden: true },
        cell: ({ row }) => (
          <div className="relative h-12 w-12 overflow-hidden rounded-md border border-border bg-background">
            {row.original.previewUrl ? (
              <Image
                src={row.original.previewUrl}
                alt={row.original.title}
                fill
                unoptimized
                className="object-cover"
              />
            ) : null}
          </div>
        ),
      },
      {
        id: "title",
        header: "Название",
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-foreground">{row.original.title}</p>
            <p className="text-xs text-foreground-muted">{row.original.slug}</p>
          </div>
        ),
      },
      {
        id: "category",
        header: "Категория",
        meta: { mobileHidden: true },
        cell: ({ row }) => (
          <Badge variant="outline">
            {categoryNameMap.get(row.original.categoryId) ?? "—"}
          </Badge>
        ),
      },
      {
        id: "slots",
        header: "Слотов",
        meta: { mobileHidden: true },
        cell: ({ row }) => <span>{row.original.slotsCount} / 10</span>,
      },
      {
        id: "costPerSlot",
        header: "За слот",
        meta: { mobileHidden: true },
        cell: ({ row }) => <span>{row.original.tokenCostPerSlot} ток.</span>,
      },
      {
        id: "totalCost",
        header: "Итого",
        meta: { mobileHidden: true },
        cell: ({ row }) => (
          <span>
            {row.original.tokenCostPerSlot * row.original.slotsCount} ток.
          </span>
        ),
      },
      {
        id: "status",
        header: "Статус",
        cell: ({ row }) => (
          <StatusBadge
            isVisible={row.original.isVisible ?? true}
            featured={row.original.featured}
          />
        ),
      },
      {
        id: "actions",
        header: "Действия",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-foreground-muted hover:text-foreground"
            >
              <Link href={`/admin/sessions/${row.original.id}/edit`}>
                <Pencil className="h-4 w-4" />
                Редактировать
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-foreground-muted hover:text-danger"
              onClick={() => setDeleteTarget(row.original)}
            >
              <Trash2 className="h-4 w-4" />
              Удалить
            </Button>
          </div>
        ),
      },
    ],
    [categoryNameMap],
  );

  async function handleDeleteConfirm(): Promise<void> {
    if (!deleteTarget) {
      return;
    }

    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  }

  async function handleSaveOrder(): Promise<void> {
    if (!pendingOrder) {
      return;
    }

    await reorderMutation.mutateAsync({ items: pendingOrder });
    setPendingOrder(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Фотосессии"
        description="Управление фотосессиями и слотами"
        action={
          <Button asChild>
            <Link href="/admin/sessions/new">
              <Plus className="h-4 w-4" />
              Создать фотосессию
            </Link>
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={viewMode === "table" ? "default" : "outline"}
          onClick={() => setViewMode("table")}
        >
          Таблица
        </Button>
        <Button
          variant={viewMode === "reorder" ? "default" : "outline"}
          onClick={() => setViewMode("reorder")}
        >
          Reorder
        </Button>
      </div>

      <div className="grid gap-2 md:grid-cols-[1fr_auto]">
        <Input
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder="Поиск по названию"
        />
      </div>

      {viewMode === "table" ? (
        <DataTable
          columns={columns}
          data={filtered}
          isLoading={sessionsQuery.isLoading}
          emptyMessage="Фотосессии не найдены"
        />
      ) : (
        <div className="space-y-4">
          <SortableList
            items={filtered}
            isLoading={sessionsQuery.isLoading}
            onReorder={(items) => setPendingOrder(items)}
            renderItem={(item) => (
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-md border border-border bg-background">
                  {item.previewUrl ? (
                    <Image
                      src={item.previewUrl}
                      alt={item.title}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {item.title}
                  </p>
                  <p className="text-xs text-foreground-muted">{item.slug}</p>
                </div>
              </div>
            )}
          />
          <Button
            onClick={() => void handleSaveOrder()}
            disabled={!pendingOrder || reorderMutation.isPending}
          >
            Сохранить порядок
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        title="Удалить фотосессию"
        description="Фотосессия будет мягко удалена (soft delete)."
        requireInput={deleteTarget?.slug}
        onConfirm={() => void handleDeleteConfirm()}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
