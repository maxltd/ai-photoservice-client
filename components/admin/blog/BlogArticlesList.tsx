"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useDeleteBlogArticle, useUpdateBlogHubSettings } from "@/lib/hooks/blog/useBlogAdmin";
import {
  BlogArticleStatus,
  type BlogArticleResponse,
  type BlogHubSettingsResponse,
  type PaginationMeta,
} from "@/lib/api/contract";

interface BlogArticlesListProps {
  initialData: BlogArticleResponse[];
  meta: PaginationMeta;
  hub: BlogHubSettingsResponse;
  filters: {
    search?: string;
    status?: string;
  };
}

function statusLabel(status: BlogArticleStatus): string {
  switch (status) {
    case BlogArticleStatus.PUBLISHED:
      return "Опубликовано";
    case BlogArticleStatus.ARCHIVED:
      return "Архив";
    default:
      return "Черновик";
  }
}

export function BlogArticlesList({ initialData, meta, hub, filters }: BlogArticlesListProps) {
  const router = useRouter();
  const deleteMutation = useDeleteBlogArticle();
  const updateHubMutation = useUpdateBlogHubSettings();
  const [hubH1, setHubH1] = useState(hub.h1);
  const [hubSubtitle, setHubSubtitle] = useState(hub.subtitle);

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

    router.push(`/admin/blog?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-surface p-4 space-y-3">
        <h2 className="text-lg font-semibold">Настройки хаба /blog/</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label>H1</Label>
            <Input value={hubH1} onChange={(event) => setHubH1(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Подзаголовок</Label>
            <Textarea
              className="min-h-48"
              value={hubSubtitle}
              onChange={(event) => setHubSubtitle(event.target.value)}
              placeholder="Например: <p>Описание блога</p><h2>Заголовок раздела</h2>"
            />
          </div>
        </div>
        <div>
          <Button
            onClick={() => updateHubMutation.mutate({ h1: hubH1, subtitle: hubSubtitle })}
            disabled={updateHubMutation.isPending}
          >
            Сохранить настройки хаба
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">Статьи блога</h1>
          <Button asChild>
            <Link href="/admin/blog/new">Новая статья</Link>
          </Button>
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
              <SelectItem value={BlogArticleStatus.DRAFT}>Черновики</SelectItem>
              <SelectItem value={BlogArticleStatus.PUBLISHED}>Опубликованные</SelectItem>
              <SelectItem value={BlogArticleStatus.ARCHIVED}>Архивные</SelectItem>
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
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-b border-border text-white/60">
              <tr>
                <th className="p-4">Название</th>
                <th className="p-4">Slug</th>
                <th className="p-4">Статус</th>
                <th className="p-4">Публикация</th>
                <th className="p-4">Рейтинг</th>
                <th className="p-4">Просмотры</th>
                <th className="p-4">Обновлено</th>
                <th className="p-4" />
              </tr>
            </thead>
            <tbody>
              {initialData.map((article) => (
                <tr key={article.id} className="border-b border-border/60 last:border-0">
                  <td className="p-4">
                    <Link
                      className="font-medium hover:text-secondary"
                      href={`/admin/blog/${article.id}/edit`}
                    >
                      {article.internalName}
                    </Link>
                  </td>
                  <td className="p-4 text-white/70">{article.slug}</td>
                  <td className="p-4 text-white/70">{statusLabel(article.status)}</td>
                  <td className="p-4 text-white/70">
                    {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="p-4 text-white/70">
                    {article.rating.average.toFixed(1)} / 5 ({article.rating.votes})
                  </td>
                  <td className="p-4 text-white/70">{article.viewsCount}</td>
                  <td className="p-4 text-white/70">
                    {new Date(article.updatedAt).toLocaleString()}
                  </td>
                  <td className="p-4 text-right">
                    {article.status === BlogArticleStatus.ARCHIVED ? (
                      <span className="text-xs text-foreground-muted">В архиве</span>
                    ) : (
                      <Button
                        variant="ghost"
                        disabled={deleteMutation.isPending}
                        onClick={() => deleteMutation.mutate(article.id)}
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
    </div>
  );
}
