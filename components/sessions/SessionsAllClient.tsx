"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { CategoryResponse, PhotoSessionListItemResponse } from "@/lib/api/contract";
import { cn } from "@/lib/utils";
import { SessionCard } from "@/components/sessions/SessionCard";

interface SessionsAllClientProps {
  categories: CategoryResponse[];
  sessions: PhotoSessionListItemResponse[];
  activeCategorySlug: string | null;
}

export function SessionsAllClient({
  categories,
  sessions,
  activeCategorySlug,
}: SessionsAllClientProps) {
  const activeCategory =
    categories.find((category) => category.slug === activeCategorySlug) ?? null;

  const visibleSessions = useMemo(() => {
    if (!activeCategory) {
      return sessions;
    }

    return sessions.filter((session) => session.categoryId === activeCategory.id);
  }, [activeCategory, sessions]);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-4 flex items-center justify-between md:mb-6">
        <div>
          <h1 className="text-xl font-semibold md:text-2xl">Все фотосессии</h1>
          <p className="mt-1 text-xs text-[--color-foreground-muted] md:text-sm">
            {activeCategory ? `Категория: ${activeCategory.name}` : "Все категории"}
          </p>
        </div>

        <Link
          href="/app/sessions"
          className="text-xs text-[--color-foreground-muted] transition hover:text-[--color-foreground]"
        >
          Назад в каталог
        </Link>
      </div>

      <div className="mb-5 overflow-x-auto pb-1 md:mb-7">
        <div className="flex min-w-max items-center gap-2">
          <Link
            href="/app/sessions/all"
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs transition",
              activeCategory === null
                ? "border-[--color-primary] bg-[--color-primary]/15 text-[--color-foreground]"
                : "border-[--color-border] bg-[--color-surface] text-[--color-foreground-muted] hover:text-[--color-foreground]",
            )}
          >
            Все
          </Link>

          {categories.map((category) => {
            const active = activeCategory?.id === category.id;

            return (
              <Link
                key={category.id}
                href={`/app/sessions/all?category=${category.slug}`}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs transition",
                  active
                    ? "border-[--color-primary] bg-[--color-primary]/15 text-[--color-foreground]"
                    : "border-[--color-border] bg-[--color-surface] text-[--color-foreground-muted] hover:text-[--color-foreground]",
                )}
              >
                {category.name}
              </Link>
            );
          })}
        </div>
      </div>

      {visibleSessions.length === 0 ? (
        <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-4 text-sm text-[--color-foreground-muted]">
          В этой категории пока нет фотосессий
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 md:gap-3">
          {visibleSessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </section>
  );
}
