'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/admin/common/DataTable';
import { SortableList } from '@/components/admin/common/SortableList';
import { ConfirmDialog } from '@/components/admin/common/ConfirmDialog';
import { StatusBadge } from '@/components/admin/common/StatusBadge';
import { PageHeader } from '@/components/admin/common/PageHeader';
import {
  type CategoryResponse,
  type PaginatedResponse,
} from '@/lib/api/contract';
import {
  useCategories,
  useDeleteCategory,
  useReorderCategories,
} from '@/lib/hooks/categories/useCategories';

interface CategoriesClientProps {
  initialData: PaginatedResponse<CategoryResponse>;
}

type ViewMode = 'table' | 'reorder';

export function CategoriesClient({ initialData }: CategoriesClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const search = searchParams.get('search') ?? '';
  const [searchValue, setSearchValue] = useState(search);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [deleteTarget, setDeleteTarget] = useState<CategoryResponse | null>(null);
  const [pendingOrder, setPendingOrder] = useState<Array<{ id: string; sortOrder: number }> | null>(null);

  const categoriesQuery = useCategories(
    { pageSize: 100, search: search || undefined },
    search ? undefined : initialData,
  );

  const deleteMutation = useDeleteCategory();
  const reorderMutation = useReorderCategories();

  const categories = categoriesQuery.data?.data ?? [];

  const columns = useMemo<Array<ColumnDef<CategoryResponse>>>(
    () => [
      {
        id: 'image',
        header: 'Изображение',
        meta: { mobileHidden: true },
        cell: ({ row }) => {
          const imageUrl = row.original.imageUrl;
          return (
            <div className="relative h-10 w-10 overflow-hidden rounded-md border border-border bg-background">
              {imageUrl ? (
                <Image src={imageUrl} alt={row.original.name} fill unoptimized className="object-cover" />
              ) : null}
            </div>
          );
        },
      },
      {
        id: 'name',
        header: 'Название',
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-foreground">{row.original.name}</p>
            <p className="text-xs text-foreground-muted">{row.original.slug}</p>
          </div>
        ),
      },
      {
        accessorKey: 'sortOrder',
        header: 'Порядок',
        meta: { mobileHidden: true },
      },
      {
        id: 'status',
        header: 'Статус',
        cell: ({ row }) => (
          <StatusBadge isVisible={row.original.isVisible} featured={row.original.featured} />
        ),
      },
      {
        id: 'actions',
        header: 'Действия',
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="sm" asChild className="text-foreground-muted hover:text-foreground">
              <Link href={`/admin/categories/${row.original.id}/edit`}>
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
    [],
  );

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const nextParams = new URLSearchParams(searchParams.toString());

    if (searchValue.trim()) {
      nextParams.set('search', searchValue.trim());
    } else {
      nextParams.delete('search');
    }

    const query = nextParams.toString();
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
        title="Категории"
        description="Управление категориями контента"
        action={
          <Button asChild>
            <Link href="/admin/categories/new">
              <Plus className="h-4 w-4" />
              Создать категорию
            </Link>
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button variant={viewMode === 'table' ? 'default' : 'outline'} onClick={() => setViewMode('table')}>
          Таблица
        </Button>
        <Button variant={viewMode === 'reorder' ? 'default' : 'outline'} onClick={() => setViewMode('reorder')}>
          Reorder
        </Button>
      </div>

      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <Input
          placeholder="Поиск по названию"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
        />
        <Button type="submit" variant="outline">
          Найти
        </Button>
      </form>

      {viewMode === 'table' ? (
        <DataTable columns={columns} data={categories} isLoading={categoriesQuery.isLoading} emptyMessage="Категории не найдены" />
      ) : (
        <div className="space-y-4">
          <SortableList
            items={categories}
            isLoading={categoriesQuery.isLoading}
            onReorder={(items) => setPendingOrder(items)}
            renderItem={(item) => (
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-md border border-border bg-background">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.name} fill unoptimized className="object-cover" />
                  ) : null}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-foreground-muted">{item.slug}</p>
                </div>
              </div>
            )}
          />
          <Button onClick={() => void handleSaveOrder()} disabled={!pendingOrder || reorderMutation.isPending}>
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
        title="Удалить категорию"
        description="Категория будет мягко удалена (soft delete)."
        requireInput={deleteTarget?.slug}
        onConfirm={() => void handleDeleteConfirm()}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
