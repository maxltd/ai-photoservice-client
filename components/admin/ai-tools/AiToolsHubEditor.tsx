"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/admin/common/PageHeader";
import { useUpdateAiToolsHub } from "@/lib/hooks/ai-tools/useAiTools";
import type { AiToolsHubSettingsResponse } from "@/lib/api/contract";

export function AiToolsHubEditor({
  initial,
}: {
  initial: AiToolsHubSettingsResponse;
}) {
  const [value, setValue] = useState(initial);
  const [jsonLdText, setJsonLdText] = useState(
    initial.jsonLd ? JSON.stringify(initial.jsonLd, null, 2) : "",
  );
  const update = useUpdateAiToolsHub();
  const set = <K extends keyof AiToolsHubSettingsResponse>(
    key: K,
    next: AiToolsHubSettingsResponse[K],
  ) => setValue((current) => ({ ...current, [key]: next }));
  async function submit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    let jsonLd: Record<string, unknown> | undefined;
    if (jsonLdText.trim()) {
      const parsed: unknown = JSON.parse(jsonLdText);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
        return;
      jsonLd = parsed as Record<string, unknown>;
    }
    await update.mutateAsync({
      h1: value.h1,
      description: value.description,
      seoSections: value.seoSections,
      seoTitle: value.seoTitle ?? undefined,
      seoDescription: value.seoDescription ?? undefined,
      canonical: value.canonical ?? undefined,
      ogTitle: value.ogTitle ?? undefined,
      ogDescription: value.ogDescription ?? undefined,
      ogImage: value.ogImage ?? undefined,
      twitterCard: value.twitterCard ?? undefined,
      jsonLd,
      isVisible: value.isVisible,
    });
  }
  return (
    <form className="space-y-8 p-6" onSubmit={(event) => void submit(event)}>
      <PageHeader
        title="Настройки хаба AI-инструментов"
        description="Контент /ai-tools/ и SEO-метаданные."
      />
      <section className="mx-auto max-w-4xl space-y-4 rounded-xl border border-border bg-surface p-5">
        <h2 className="text-lg font-medium">Основной контент</h2>
        <label className="block space-y-2 text-sm">
          H1
          <Input
            value={value.h1}
            onChange={(event) => set("h1", event.target.value)}
          />
        </label>
        <label className="block space-y-2 text-sm">
          Описание
          <Textarea
            className="min-h-48"
            value={value.description}
            onChange={(event) => set("description", event.target.value)}
          />
        </label>
      </section>
      <section className="mx-auto max-w-4xl space-y-4 rounded-xl border border-border bg-surface p-5">
        <h2 className="text-lg font-medium">SEO-текст</h2>
        {value.seoSections.map((section, index) => (
          <div
            key={index}
            className="space-y-3 rounded-lg border border-border p-4"
          >
            <Input
              placeholder="Заголовок"
              value={section.heading}
              onChange={(event) =>
                set(
                  "seoSections",
                  value.seoSections.map((item, itemIndex) =>
                    itemIndex === index
                      ? { ...item, heading: event.target.value }
                      : item,
                  ) as typeof value.seoSections,
                )
              }
            />
            <Textarea
              className="min-h-32"
              placeholder="Текст"
              value={section.body}
              onChange={(event) =>
                set(
                  "seoSections",
                  value.seoSections.map((item, itemIndex) =>
                    itemIndex === index
                      ? { ...item, body: event.target.value }
                      : item,
                  ) as typeof value.seoSections,
                )
              }
            />
          </div>
        ))}
      </section>
      <section className="mx-auto max-w-4xl space-y-4 rounded-xl border border-border bg-surface p-5">
        <h2 className="text-lg font-medium">SEO и Open Graph</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            SEO Title
            <Input
              value={value.seoTitle ?? ""}
              onChange={(event) => set("seoTitle", event.target.value || null)}
            />
          </label>
          <label className="space-y-2 text-sm">
            Canonical
            <Input
              value={value.canonical ?? ""}
              onChange={(event) => set("canonical", event.target.value || null)}
            />
          </label>
          <label className="space-y-2 text-sm">
            SEO Description
            <Input
              value={value.seoDescription ?? ""}
              onChange={(event) =>
                set("seoDescription", event.target.value || null)
              }
            />
          </label>
          <label className="space-y-2 text-sm">
            OG Title
            <Input
              value={value.ogTitle ?? ""}
              onChange={(event) => set("ogTitle", event.target.value || null)}
            />
          </label>
          <label className="space-y-2 text-sm">
            OG Image URL
            <Input
              value={value.ogImage ?? ""}
              onChange={(event) => set("ogImage", event.target.value || null)}
            />
          </label>
          <label className="space-y-2 text-sm">
            Twitter Card
            <Input
              value={value.twitterCard ?? ""}
              onChange={(event) =>
                set("twitterCard", event.target.value || null)
              }
            />
          </label>
        </div>
        <label className="block space-y-2 text-sm">
          OG Description
          <Textarea
            value={value.ogDescription ?? ""}
            onChange={(event) =>
              set("ogDescription", event.target.value || null)
            }
          />
        </label>
        <label className="block space-y-2 text-sm">
          JSON-LD
          <textarea
            className="min-h-48 w-full rounded-md border border-border bg-background p-3 font-mono text-xs"
            value={jsonLdText}
            onChange={(event) => setJsonLdText(event.target.value)}
          />
        </label>
      </section>
      <section className="mx-auto max-w-4xl space-y-3 rounded-xl border border-border bg-surface p-5 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value.isVisible}
            onChange={(event) => set("isVisible", event.target.checked)}
          />{" "}
          Показывать хаб
        </label>
      </section>
      <div className="mx-auto max-w-4xl">
        <Button type="submit" disabled={update.isPending}>
          {update.isPending ? "Сохранение…" : "Сохранить настройки"}
        </Button>
      </div>
    </form>
  );
}
