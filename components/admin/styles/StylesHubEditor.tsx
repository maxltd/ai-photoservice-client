"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateStylesHubSettings } from "@/lib/hooks/styles/usePhotoSessionStyles";
import type { StylesHubSettingsResponse } from "@/lib/api/contract";

export function StylesHubEditor({ initial }: { initial: StylesHubSettingsResponse }) {
  const [value, setValue] = useState(initial);
  const [jsonLdText, setJsonLdText] = useState(initial.jsonLd ? JSON.stringify(initial.jsonLd, null, 2) : "");
  const update = useUpdateStylesHubSettings();

  function setField<K extends keyof StylesHubSettingsResponse>(key: K, next: StylesHubSettingsResponse[K]): void {
    setValue((current) => ({ ...current, [key]: next }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    let jsonLd: Record<string, unknown> | undefined;
    if (jsonLdText.trim()) {
      const parsed: unknown = JSON.parse(jsonLdText);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return;
      jsonLd = parsed as Record<string, unknown>;
    }
    await update.mutateAsync({
      h1: value.h1 ?? "",
      description: value.description ?? "",
      seoTitle: value.seoTitle ?? "",
      seoDescription: value.seoDescription ?? "",
      canonical: value.canonical || undefined,
      robotsIndex: value.robotsIndex,
      robotsFollow: value.robotsFollow,
      ogUrl: value.ogUrl || undefined,
      ogTitle: value.ogTitle ?? "",
      ogDescription: value.ogDescription ?? "",
      ogImage: value.ogImage || undefined,
      jsonLd,
      showInSitemap: value.showInSitemap,
    });
  }

  return (
    <form className="mx-auto max-w-4xl space-y-8 p-6" onSubmit={(event) => void submit(event)}>
      <header>
        <h1 className="text-2xl font-semibold">Настройки страницы стилей</h1>
        <p className="mt-1 text-sm text-foreground-muted">Контент `/styles/` и SEO-метаданные.</p>
      </header>
      <section className="space-y-4 rounded-xl border border-border bg-surface p-5">
        <h2 className="text-lg font-medium">Основной контент</h2>
        <label className="block space-y-2 text-sm">H1<Input value={value.h1 ?? ""} onChange={(event) => setField("h1", event.target.value || null)} /></label>
        <label className="block space-y-2 text-sm">Описание<Textarea className="min-h-48" value={value.description ?? ""} onChange={(event) => setField("description", event.target.value || null)} placeholder="Например: <p>Описание страницы</p><h2>Заголовок раздела</h2>" /></label>
      </section>
      <section className="space-y-4 rounded-xl border border-border bg-surface p-5">
        <h2 className="text-lg font-medium">SEO и Open Graph</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-2 text-sm">SEO Title<Input value={value.seoTitle ?? ""} onChange={(event) => setField("seoTitle", event.target.value || null)} /></label>
          <label className="block space-y-2 text-sm">Canonical URL<Input value={value.canonical ?? ""} onChange={(event) => setField("canonical", event.target.value || null)} /></label>
          <label className="block space-y-2 text-sm">SEO Description<Input value={value.seoDescription ?? ""} onChange={(event) => setField("seoDescription", event.target.value || null)} /></label>
          <label className="block space-y-2 text-sm">OG URL<Input value={value.ogUrl ?? ""} onChange={(event) => setField("ogUrl", event.target.value || null)} /></label>
          <label className="block space-y-2 text-sm">OG Title<Input value={value.ogTitle ?? ""} onChange={(event) => setField("ogTitle", event.target.value || null)} /></label>
          <label className="block space-y-2 text-sm">OG Image URL<Input value={value.ogImage ?? ""} onChange={(event) => setField("ogImage", event.target.value || null)} /></label>
        </div>
        <label className="block space-y-2 text-sm">OG Description<Textarea className="min-h-24" value={value.ogDescription ?? ""} onChange={(event) => setField("ogDescription", event.target.value || null)} /></label>
        <label className="block space-y-2 text-sm">JSON-LD<textarea className="min-h-48 w-full rounded-md border border-border bg-background p-3 font-mono text-xs" value={jsonLdText} onChange={(event) => setJsonLdText(event.target.value)} placeholder="Дополнительный schema.org JSON-LD" /></label>
      </section>
      <section className="space-y-3 rounded-xl border border-border bg-surface p-5 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" checked={value.robotsIndex} onChange={(event) => setField("robotsIndex", event.target.checked)} /> Index</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={value.robotsFollow} onChange={(event) => setField("robotsFollow", event.target.checked)} /> Follow</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={value.showInSitemap} onChange={(event) => setField("showInSitemap", event.target.checked)} /> Показывать в sitemap</label>
      </section>
      <Button type="submit" disabled={update.isPending}>{update.isPending ? "Сохранение…" : "Сохранить настройки"}</Button>
    </form>
  );
}
