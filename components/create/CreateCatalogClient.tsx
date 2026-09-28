"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  type CategoryResponse,
  type GenerationOrderListItemResponse,
  type PresetListItemResponse,
} from "@/lib/api/contract";
import { cn } from "@/lib/utils";
import { MiniOrderCard } from "@/components/create/MiniOrderCard";
import { PresetCard } from "@/components/create/PresetCard";

interface CreateCatalogClientProps {
  categories: CategoryResponse[];
  presets: PresetListItemResponse[];
  recentOrders: GenerationOrderListItemResponse[];
}

export function CreateCatalogClient({
  categories,
  presets,
  recentOrders,
}: CreateCatalogClientProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const sections = useMemo(
    () =>
      categories
        .filter((cat) => activeCategoryId === null || cat.id === activeCategoryId)
        .map((cat) => ({
          category: cat,
          presets: presets.filter((preset) => preset.categoryId === cat.id),
        }))
        .filter((section) => section.presets.length > 0),
    [activeCategoryId, categories, presets],
  );

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-4 flex items-center justify-between md:mb-6">
        <h1 className="text-xl font-semibold md:text-2xl">Каталог пресетов</h1>
      </div>

      <div className="mb-5 overflow-x-auto pb-1 md:mb-7">
        <div className="flex min-w-max items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveCategoryId(null)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs transition",
              activeCategoryId === null
                ? "border-[--color-primary] bg-[--color-primary]/15 text-[--color-foreground]"
                : "border-[--color-border] bg-[--color-surface] text-[--color-foreground-muted] hover:text-[--color-foreground]",
            )}
          >
            Все
          </button>

          {categories.map((category) => {
            const active = activeCategoryId === category.id;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategoryId(category.id)}
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

      {recentOrders.length > 0 ? (
        <section className="mb-6 space-y-3 md:mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-[--color-foreground-muted]">
              Последние работы
            </h2>
            <Link
              href="/app/gallery"
              className="text-xs text-[--color-foreground-muted] transition hover:text-[--color-foreground]"
            >
              Смотреть все
            </Link>
          </div>

          <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1 md:gap-3">
            {recentOrders.map((order) => (
              <MiniOrderCard key={order.id} order={order} />
            ))}
          </div>
        </section>
      ) : null}

      <div className="space-y-7 md:space-y-8">
        {sections.map((section) => (
          <section key={section.category.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-[--color-foreground-muted]">
                {section.category.name}
              </h2>
              <Link
                href={`/app/create/all?category=${section.category.slug}`}
                className="text-xs text-[--color-foreground-muted] transition hover:text-[--color-foreground]"
              >
                Смотреть все
              </Link>
            </div>

            <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1 md:gap-3">
              {section.presets.map((preset) => (
                <PresetCard key={preset.id} preset={preset} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
