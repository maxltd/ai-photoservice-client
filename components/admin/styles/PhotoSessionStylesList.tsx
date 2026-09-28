"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { useDeletePhotoSessionStyle } from "@/lib/hooks/styles/usePhotoSessionStyles";
import {
  PhotoSessionStyleStatus,
  type PaginationMeta,
  type PhotoSessionStyleResponse,
} from "@/lib/api/contract";

interface PhotoSessionStylesListProps {
  initialData: PhotoSessionStyleResponse[];
  meta: PaginationMeta;
  filters: {
    search?: string;
    status?: string;
  };
}

function statusLabel(status: PhotoSessionStyleStatus): string {
  switch (status) {
    case PhotoSessionStyleStatus.PUBLISHED:
      return "Опубликовано";
    case PhotoSessionStyleStatus.ARCHIVED:
      return "Архив";
    default:
      return "Черновик";
  }
}

function statusVariant(status: PhotoSessionStyleStatus):
  | "default"
  | "secondary"
  | "outline" {
  switch (status) {
    case PhotoSessionStyleStatus.PUBLISHED:
      return "default";
    case PhotoSessionStyleStatus.ARCHIVED:
      return "secondary";
    default:
      return "outline";
  }
}

export function PhotoSessionStylesList({
  initialData,
  meta,
  filters,
}: PhotoSessionStylesListProps) {
  const router = useRouter();
  const deleteMutation = useDeletePhotoSessionStyle();

  function applyFilters(next: { search?: string; status?: string; page?: number }): void {
    const params = new URLSearchParams();

    const searchValue = next.search ?? filters.search ?? "";
    const statusValue = next.status ?? filters.status ?? "all";
    const pageValue = String(next.page ?? 1);

    if (searchValue.trim().length > 0) {
      params.set("search", searchValue.trim());
    }

    if (statusValue !== "all") {
      params.set("status", statusValue);
    }

    params.set("page", pageValue);
    params.set("pageSize", String(meta.pageSize));

    router.push(`/admin/styles?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Стили фотосессий</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/styles/hub">Настройки страницы</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/styles/new">Новый стиль</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 rounded-lg border border-border bg-surface p-4 md:grid-cols-[1fr_220px_auto]">
        <Input
          defaultValue={filters.search ?? ""}
          placeholder="Поиск по названию, slug, H1"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              applyFilters({
                search: (event.currentTarget as HTMLInputElement).value,
                page: 1,
              });
            }
          }}
        />

        <Select
          value={filters.status ?? "all"}
          onValueChange={(value) => applyFilters({ status: value, page: 1 })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value={PhotoSessionStyleStatus.DRAFT}>Черновики</SelectItem>
            <SelectItem value={PhotoSessionStyleStatus.PUBLISHED}>Опубликованные</SelectItem>
            <SelectItem value={PhotoSessionStyleStatus.ARCHIVED}>Архивные</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() => applyFilters({ search: "", status: "all", page: 1 })}
        >
          Сбросить
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-border text-white/60">
            <tr>
              <th className="p-4">Название</th>
              <th className="p-4">Slug</th>
              <th className="p-4">Статус</th>
              <th className="p-4">Обновлено</th>
              <th className="p-4">Последний редактор</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody>
            {initialData.map((style) => (
              <tr key={style.id} className="border-b border-border/60 last:border-0">
                <td className="p-4">
                  <Link
                    className="font-medium hover:text-secondary"
                    href={`/admin/styles/${style.id}/edit`}
                  >
                    {style.internalName}
                  </Link>
                </td>
                <td className="p-4 text-white/70">{style.slug}</td>
                <td className="p-4">
                  <Badge variant={statusVariant(style.status)}>
                    {statusLabel(style.status)}
                  </Badge>
                </td>
                <td className="p-4 text-white/70">
                  {new Date(style.updatedAt).toLocaleString()}
                </td>
                <td className="p-4 text-white/70">{style.lastEditedByName ?? "—"}</td>
                <td className="p-4 text-right">
                  {style.status === PhotoSessionStyleStatus.ARCHIVED ? (
                    <span className="text-xs text-foreground-muted">В архиве</span>
                  ) : (
                    <Button
                      variant="ghost"
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate(style.id)}
                    >
                      В архив
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-foreground-muted">
        <p>
          Страница {meta.page} из {meta.totalPages} • всего {meta.total}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={meta.page <= 1}
            onClick={() => applyFilters({ page: meta.page - 1 })}
          >
            Назад
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={meta.page >= meta.totalPages}
            onClick={() => applyFilters({ page: meta.page + 1 })}
          >
            Вперёд
          </Button>
        </div>
      </div>
    </div>
  );
}
