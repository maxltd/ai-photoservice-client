"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  NanoBananaPageStatus,
  type NanoBananaPageResponse,
  type PaginationMeta,
} from "@/lib/api/contract";
import { ConfirmDialog } from "@/components/admin/common/ConfirmDialog";
import { useDeleteNanoBanana } from "@/lib/hooks/nano-banana/useNanoBananaPages";

function label(status: NanoBananaPageStatus) {
  return status === NanoBananaPageStatus.PUBLISHED
    ? "Опубликовано"
    : status === NanoBananaPageStatus.ARCHIVED
      ? "Архив"
      : "Черновик";
}
export function NanoBananaPagesList({
  initialData,
  meta,
  filters,
}: {
  initialData: NanoBananaPageResponse[];
  meta: PaginationMeta;
  filters: { search?: string; status: string };
}) {
  const router = useRouter();
  const remove = useDeleteNanoBanana();
  const [archiveTarget, setArchiveTarget] = useState<NanoBananaPageResponse | null>(null);
  function apply(next: { search?: string; status?: string; page?: number }) {
    const query = new URLSearchParams();
    const search = next.search ?? filters.search ?? "";
    const status = next.status ?? filters.status;
    if (search.trim()) query.set("search", search.trim());
    if (status !== "all") query.set("status", status);
    query.set("page", String(next.page ?? 1));
    query.set("pageSize", String(meta.pageSize));
    router.push(`/admin/nano-banana?${query.toString()}`);
  }
  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Nano Banana</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            CMS-страницы и публичные карточки хаба
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/nano-banana/hub">Настройки хаба</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/nano-banana/new">Новая страница</Link>
          </Button>
        </div>
      </div>
      <div className="grid gap-3 rounded-lg border border-border bg-surface p-4 md:grid-cols-[1fr_220px_auto]">
        <Input
          defaultValue={filters.search ?? ""}
          placeholder="Поиск по названию, slug, H1"
          onKeyDown={(event) => {
            if (event.key === "Enter")
              apply({ search: event.currentTarget.value });
          }}
        />
        <Select
          value={filters.status}
          onValueChange={(status) => apply({ status })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value={NanoBananaPageStatus.DRAFT}>
              Черновики
            </SelectItem>
            <SelectItem value={NanoBananaPageStatus.PUBLISHED}>
              Опубликованные
            </SelectItem>
            <SelectItem value={NanoBananaPageStatus.ARCHIVED}>
              Архивные
            </SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => apply({ search: "", status: "all" })}
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
                    href={`/admin/nano-banana/${page.id}/edit`}
                  >
                    {page.internalName}
                  </Link>
                  <div className="text-xs text-foreground-muted">{page.h1}</div>
                </td>
                <td className="p-4 text-white/70">{page.slug}</td>
                <td className="p-4">
                  <Badge
                    variant={
                      page.status === NanoBananaPageStatus.PUBLISHED
                        ? "default"
                        : page.status === NanoBananaPageStatus.ARCHIVED
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {label(page.status)}
                  </Badge>
                </td>
                <td className="p-4 text-white/70">
                  {new Date(page.updatedAt).toLocaleString()}
                </td>
                <td className="p-4 text-right">
                  {page.status === NanoBananaPageStatus.ARCHIVED ? (
                    <span className="text-xs text-foreground-muted">
                      В архиве
                    </span>
                  ) : (
                    <Button
                      variant="ghost"
                      onClick={() => setArchiveTarget(page)}
                      disabled={remove.isPending}
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
      <ConfirmDialog
        open={Boolean(archiveTarget)}
        onOpenChange={(open) => {
          if (!open) setArchiveTarget(null);
        }}
        title="Архивировать страницу?"
        description="Страница перестанет быть доступна публично."
        confirmLabel="В архив"
        onConfirm={() => {
          if (!archiveTarget) return;
          void remove.mutateAsync(archiveTarget.id).then(() => {
            setArchiveTarget(null);
          });
        }}
        isLoading={remove.isPending}
      />
      <div className="flex items-center justify-between text-sm text-foreground-muted">
        <span>
          Страница {meta.page} из {meta.totalPages} · всего {meta.total}
        </span>
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
