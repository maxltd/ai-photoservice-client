"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  type CategoryResponse,
  type PresetListItemResponse,
} from "@/lib/api/contract";
import {
  useDeletePreset,
  usePresets,
  useReorderPresets,
} from "@/lib/hooks/presets/usePresets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/admin/common/DataTable";
import { SortableList } from "@/components/admin/common/SortableList";
import { ConfirmDialog } from "@/components/admin/common/ConfirmDialog";
import { StatusBadge } from "@/components/admin/common/StatusBadge";
import { PageHeader } from "@/components/admin/common/PageHeader";

interface PresetsClientProps {
  initialData: PresetListItemResponse[];
  categories: CategoryResponse[];
}

type ViewMode = "table" | "reorder";

export function PresetsClient({ initialData, categories }: PresetsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") ?? "";
  const categoryId = searchParams.get("categoryId") ?? "";

  const [searchValue, setSearchValue] = useState(search);
  const [categoryFilter, setCategoryFilter] = useState(categoryId);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [deleteTarget, setDeleteTarget] =
    useState<PresetListItemResponse | null>(null);
  const [pendingOrder, setPendingOrder] = useState<Array<{
    id: string;
    sortOrder: number;
  }> | null>(null);

  const presetsQuery = usePresets(
    {
      search: search || undefined,
      categoryId: categoryFilter || undefined,
    },
    !search && !categoryFilter ? initialData : undefined,
  );

  const deleteMutation = useDeletePreset();
  const reorderMutation = useReorderPresets();

  const presets = presetsQuery.data ?? [];
  const refetchPresets = presetsQuery.refetch;

  useEffect(() => {
    void refetchPresets();
  }, [refetchPresets]);
  const categoryNameMap = useMemo(() => {
    return new Map(categories.map((category) => [category.id, category.name]));
  }, [categories]);

  const columns = useMemo<Array<ColumnDef<PresetListItemResponse>>>(
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
        id: "cost",
        header: "Стоимость",
        meta: { mobileHidden: true },
        cell: ({ row }) => <span>{row.original.tokenCost} токенов</span>,
      },
      {
        id: "parameters",
        header: "Параметры",
        meta: { mobileHidden: true },
        cell: () => <span className="text-foreground-muted">—</span>,
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
        cell: ({ row }) => {
          const presetId = row.original.id?.trim();
          const editHref = presetId
            ? `/admin/presets/${encodeURIComponent(presetId)}/edit`
            : "/admin/presets";

          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-foreground-muted hover:text-foreground"
              >
                <Link href={editHref}>
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
          );
        },
      },
    ],
    [categoryNameMap],
  );

  function applyFilters(): void {
    const next = new URLSearchParams(searchParams.toString());

    if (searchValue.trim()) {
      next.set("search", searchValue.trim());
    } else {
      next.delete("search");
    }

    if (categoryFilter) {
      next.set("categoryId", categoryFilter);
    } else {
      next.delete("categoryId");
    }

    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

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
        title="Пресеты"
        description="Управление пресетами и параметрами"
        action={
          <Button asChild>
            <Link href="/admin/presets/new">
              <Plus className="h-4 w-4" />
              Создать пресет
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

      <div className="grid gap-2 md:grid-cols-[1fr_240px_auto]">
        <Input
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder="Поиск по названию"
        />
        <Select
          value={categoryFilter || "all"}
          onValueChange={(value) =>
            setCategoryFilter(value === "all" ? "" : value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Категория" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все категории</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="button" variant="outline" onClick={applyFilters}>
          Применить
        </Button>
      </div>

      {viewMode === "table" ? (
        <DataTable
          columns={columns}
          data={presets}
          isLoading={presetsQuery.isLoading}
          emptyMessage="Пресеты не найдены"
        />
      ) : (
        <div className="space-y-4">
          <SortableList
            items={presets}
            isLoading={presetsQuery.isLoading}
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
        title="Удалить пресет"
        description="Пресет будет мягко удалён (soft delete)."
        requireInput={deleteTarget?.slug}
        onConfirm={() => void handleDeleteConfirm()}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
