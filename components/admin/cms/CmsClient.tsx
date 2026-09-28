"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { FileText, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { DataTable } from "@/components/admin/common/DataTable";
import { ConfirmDialog } from "@/components/admin/common/ConfirmDialog";
import { PageHeader } from "@/components/admin/common/PageHeader";
import { StatusBadge } from "@/components/admin/common/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiGet } from "@/lib/api/client";
import {
  API_ROUTES,
  type CmsPageResponse,
  type PaginatedResponse,
  type PaginationMeta,
} from "@/lib/api/contract";
import { useDeleteCmsPage } from "@/lib/hooks/cms/useCmsAdmin";
import { queryKeys } from "@/lib/query/keys";

interface CmsClientProps {
  initialData: CmsPageResponse[];
  initialMeta: PaginationMeta;
}

export function CmsClient({ initialData, initialMeta }: CmsClientProps) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [isPublished, setIsPublished] = useState<boolean | undefined>(
    undefined,
  );
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<CmsPageResponse | null>(
    null,
  );

  const deleteMutation = useDeleteCmsPage();

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const cmsQuery = useQuery({
    queryKey: queryKeys.cms.adminPages({
      search,
      isPublished,
      page,
      pageSize: 20,
    }),
    queryFn: () =>
      apiGet<PaginatedResponse<CmsPageResponse>>(API_ROUTES.ADMIN_CMS_PAGES, {
        search: search || undefined,
        isPublished,
        page,
        pageSize: 20,
      }),
    initialData:
      page === 1 && !search && isPublished === undefined
        ? { data: initialData, meta: initialMeta }
        : undefined,
    staleTime: 30_000,
  });

  const meta = cmsQuery.data?.meta ?? initialMeta;

  const columns = useMemo<Array<ColumnDef<CmsPageResponse>>>(
    () => [
      {
        id: "title",
        header: "Заголовок",
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.title}</p>
            <p className="text-xs text-[--color-foreground-muted]">
              {row.original.slug}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "h1",
        header: "H1",
        cell: ({ row }) => (
          <div className="max-w-[200px] truncate" title={row.original.h1}>
            {row.original.h1}
          </div>
        ),
      },
      {
        id: "status",
        header: "Статус",
        cell: ({ row }) => (
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              className={
                row.original.isPublished
                  ? "bg-[--color-success]/10 text-[--color-success] border border-[--color-success]/20"
                  : "bg-[--color-warning]/10 text-[--color-warning] border border-[--color-warning]/20"
              }
            >
              {row.original.isPublished ? "Опублик." : "Черновик"}
            </Badge>
            <StatusBadge isVisible={row.original.isVisible} />
          </div>
        ),
      },
      {
        accessorKey: "sortOrder",
        header: "Порядок",
        meta: { className: "text-center" },
      },
      {
        id: "updatedAt",
        header: "Обновлено",
        cell: ({ row }) =>
          new Date(row.original.updatedAt).toLocaleDateString("ru"),
      },
      {
        id: "actions",
        header: "Действия",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-[--color-foreground-muted] hover:text-[--color-foreground]"
              onClick={() => router.push(`/admin/cms/${row.original.id}/edit`)}
            >
              <Pencil className="h-4 w-4" />
              Редактировать
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-[--color-foreground-muted] hover:text-[--color-danger]"
              onClick={() => setDeleteTarget(row.original)}
            >
              <Trash2 className="h-4 w-4" />
              Удалить
            </Button>
          </div>
        ),
      },
    ],
    [router],
  );

  async function handleDeleteConfirm(): Promise<void> {
    if (!deleteTarget) {
      return;
    }

    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="CMS-страницы"
        description="Управление статическими страницами и SEO"
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => router.push("/admin/cms/new?type=faq")}>
              <Plus className="h-4 w-4" />
              Создать FAQ
            </Button>
            <Button onClick={() => router.push("/admin/cms/new")}>
              <Plus className="h-4 w-4" />
              Создать страницу
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[--color-foreground-muted]" />
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Поиск по заголовку, slug..."
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={isPublished === undefined ? "default" : "outline"}
            onClick={() => {
              setIsPublished(undefined);
              setPage(1);
            }}
          >
            Все
          </Button>
          <Button
            variant={isPublished === true ? "default" : "outline"}
            onClick={() => {
              setIsPublished(true);
              setPage(1);
            }}
          >
            Опубликованные
          </Button>
          <Button
            variant={isPublished === false ? "default" : "outline"}
            onClick={() => {
              setIsPublished(false);
              setPage(1);
            }}
          >
            Черновики
          </Button>
        </div>
      </div>

      {!cmsQuery.isLoading && (cmsQuery.data?.data.length ?? 0) === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <FileText className="h-10 w-10 text-[--color-foreground-muted]" />
          <p className="text-[--color-foreground-muted]">
            CMS-страниц пока нет
          </p>
          <Button size="sm" onClick={() => router.push("/admin/cms/new")}>
            Создать первую
          </Button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={cmsQuery.data?.data ?? []}
          isLoading={cmsQuery.isLoading}
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

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        title="Удалить CMS-страницу?"
        description={`Страница «${deleteTarget?.title ?? ""}» будет удалена. Это действие необратимо.`}
        confirmLabel="Удалить"
        variant="danger"
        requireInput={deleteTarget?.slug}
        onConfirm={() => void handleDeleteConfirm()}
        isLoading={deleteMutation.isPending}
      />

      {cmsQuery.isFetching ? (
        <div className="flex items-center gap-2 text-xs text-[--color-foreground-muted]">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Обновление списка...
        </div>
      ) : null}
    </div>
  );
}
