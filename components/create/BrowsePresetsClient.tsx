"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import type { CategoryResponse, PresetListItemResponse } from "@/lib/api/contract";
import { PresetCard } from "@/components/create/PresetCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, pluralize } from "@/lib/utils";

interface BrowsePresetsClientProps {
  categories: CategoryResponse[];
  presets: PresetListItemResponse[];
  initialCategorySlug: string | null;
}

export function BrowsePresetsClient({
  categories,
  presets,
  initialCategorySlug,
}: BrowsePresetsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [activeCategorySlug, setActiveCategorySlug] = useState<string | null>(
    categories.some((category) => category.slug === initialCategorySlug)
      ? initialCategorySlug
      : null,
  );

  const normalizedSearch = search.trim().toLowerCase();

  const activeCategoryId = useMemo(
    () => categories.find((category) => category.slug === activeCategorySlug)?.id ?? null,
    [activeCategorySlug, categories],
  );

  const filtered = useMemo(
    () =>
      presets.filter((preset) => {
        const categoryMatched = !activeCategoryId || preset.categoryId === activeCategoryId;
        const searchMatched =
          !normalizedSearch || preset.title.toLowerCase().includes(normalizedSearch);

        return categoryMatched && searchMatched && preset.isVisible !== false;
      }),
    [activeCategoryId, normalizedSearch, presets],
  );

  const activeCategoryName =
    categories.find((category) => category.slug === activeCategorySlug)?.name ?? "Все категории";

  const setCategory = (slug: string | null) => {
    setActiveCategorySlug(slug);

    const params = new URLSearchParams(searchParams.toString());

    if (slug) {
      params.set("category", slug);
    } else {
      params.delete("category");
    }

    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  };

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-4 flex items-center justify-between gap-3 md:mb-6">
        <div>
          <h1 className="text-xl font-semibold md:text-2xl">Смотреть все пресеты</h1>
          <p className="mt-1 text-xs text-[--color-foreground-muted] md:text-sm">
            {activeCategoryName}
          </p>
        </div>

        <Link
          href="/app/create/catalog"
          className="text-xs text-[--color-foreground-muted] transition hover:text-[--color-foreground]"
        >
          Назад в каталог
        </Link>
      </div>

      <div className="relative mb-4 md:mb-5">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[--color-foreground-muted]" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Поиск по пресетам…"
          className="pl-9 pr-11"
        />
        {search ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setSearch("")}
            className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
            aria-label="Очистить поиск"
          >
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div>

      <div className="mb-5 overflow-x-auto pb-1 md:mb-6">
        <div className="flex min-w-max items-center gap-2">
          <button
            type="button"
            onClick={() => setCategory(null)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs transition",
              activeCategorySlug === null
                ? "border-[--color-primary] bg-[--color-primary]/15 text-[--color-foreground]"
                : "border-[--color-border] bg-[--color-surface] text-[--color-foreground-muted] hover:text-[--color-foreground]",
            )}
          >
            Все
          </button>

          {categories.map((category) => {
            const active = activeCategorySlug === category.slug;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setCategory(category.slug)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs transition",
                  active
                    ? "border-[--color-primary] bg-[--color-primary]/15 text-[--color-foreground]"
                    : "border-[--color-border] bg-[--color-surface] text-[--color-foreground-muted] hover:text-[--color-foreground]",
                )}
              >
                {category.name}
              </button>
            );
          })}
        </div>
      </div>

      <p className="mb-3 text-xs text-[--color-foreground-muted] md:mb-4 md:text-sm">
        Найдено {filtered.length} {pluralize(filtered.length, "результат", "результата", "результатов")}
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-4 text-sm text-[--color-foreground-muted] md:p-5">
          Ничего не найдено. Попробуйте изменить категорию или поисковый запрос.
        </div>
      ) : (
        <div className="grid grid-cols-2 justify-items-start gap-2 sm:grid-cols-3 md:gap-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((preset) => (
            <PresetCard key={preset.id} preset={preset} />
          ))}
        </div>
      )}
    </section>
  );
}
