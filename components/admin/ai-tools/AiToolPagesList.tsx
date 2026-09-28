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
import {
  AiToolPageStatus,
  type AiToolPageResponse,
  type PaginationMeta,
} from "@/lib/api/contract";
import { apiDelete } from "@/lib/api/client";
import { API_ROUTES } from "@/lib/api/contract";

interface Props {
  initialData: AiToolPageResponse[];
  meta: PaginationMeta;
  filters: { search?: string; status?: string };
}
const label = (status: AiToolPageStatus): string =>
  status === AiToolPageStatus.PUBLISHED
    ? "Опубликовано"
    : status === AiToolPageStatus.ARCHIVED
      ? "Архив"
      : "Черновик";
const variant = (
  status: AiToolPageStatus,
): "default" | "secondary" | "outline" =>
  status === AiToolPageStatus.PUBLISHED
    ? "default"
    : status === AiToolPageStatus.ARCHIVED
      ? "secondary"
      : "outline";

export function AiToolPagesList({ initialData, meta, filters }: Props) {
  const router = useRouter();
  const apply = (next: { search?: string; status?: string; page?: number }) => {
    const params = new URLSearchParams();
    const search = next.search ?? filters.search ?? "";
    const status = next.status ?? filters.status ?? "all";
    params.set("page", String(next.page ?? 1));
    params.set("pageSize", String(meta.pageSize));
    if (search.trim()) params.set("search", search.trim());
    if (status !== "all") params.set("status", status);
    router.push(`/admin/ai-tools?${params.toString()}`);
  };
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">AI-инструменты</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/ai-tools/hub">Настройки страницы</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/ai-tools/pages/new">Новая страница</Link>
          </Button>
        </div>
      </div>
      <div className="grid gap-3 rounded-lg border border-border bg-surface p-4 md:grid-cols-[1fr_220px_auto]">
        <Input
          defaultValue={filters.search ?? ""}
          placeholder="Поиск по названию, slug, H1"
          onKeyDown={(event) => {
            if (event.key === "Enter")
              apply({ search: event.currentTarget.value, page: 1 });
          }}
        />
        <Select
          value={filters.status ?? "all"}
          onValueChange={(value) => apply({ status: value, page: 1 })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value={AiToolPageStatus.DRAFT}>Черновики</SelectItem>
            <SelectItem value={AiToolPageStatus.PUBLISHED}>
              Опубликованные
            </SelectItem>
            <SelectItem value={AiToolPageStatus.ARCHIVED}>Архивные</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => apply({ search: "", status: "all", page: 1 })}
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
              <th className="p-4" />
            </tr>
          </thead>
          <tbody>
            {initialData.map((page) => (
              <tr
                key={page.id}
                className="border-b border-border/60 last:border-0"
              >
                <td className="p-4">
                  <Link
                    className="font-medium hover:text-secondary"
                    href={`/admin/ai-tools/pages/${page.id}/edit`}
                  >
                    {page.internalName}
                  </Link>
                </td>
                <td className="p-4 text-white/70">{page.slug}</td>
                <td className="p-4">
                  <Badge variant={variant(page.status)}>
                    {label(page.status)}
                  </Badge>
                </td>
                <td className="p-4 text-white/70">
                  {new Date(page.updatedAt).toLocaleString()}
                </td>
                <td className="p-4 text-right">
                  {page.status === AiToolPageStatus.ARCHIVED ? (
                    <span className="text-xs text-foreground-muted">
                      В архиве
                    </span>
                  ) : (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        void apiDelete(
                          API_ROUTES.ADMIN_AI_TOOL_PAGE_BY_ID(page.id),
                        ).then(() => router.refresh());
                      }}
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
            onClick={() => apply({ page: meta.page - 1 })}
          >
            Назад
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={meta.page >= meta.totalPages}
            onClick={() => apply({ page: meta.page + 1 })}
          >
            Вперёд
          </Button>
        </div>
      </div>
    </div>
  );
}
