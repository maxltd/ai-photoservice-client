"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  type PricingPageSettingsResponse,
  type UpdatePricingPageSettingsRequest,
} from "@/lib/api/contract";
import { useUpdateAdminPricingPage } from "@/lib/hooks/pricing-page/usePricingPageAdmin";

interface Props { initialSettings: PricingPageSettingsResponse }

export function PricingPageSettingsClient({ initialSettings }: Props) {
  const [settings, setSettings] = useState(initialSettings);
  const mutation = useUpdateAdminPricingPage();
  const update = (field: keyof UpdatePricingPageSettingsRequest, value: string | boolean) =>
    setSettings((current) => ({ ...current, [field]: value }));

  function submit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    mutation.mutate({
      h1: settings.h1,
      description: settings.description,
      seoTitle: settings.seoTitle ?? "",
      seoDescription: settings.seoDescription ?? "",
      canonical: settings.canonical ?? "",
      robotsIndex: settings.robotsIndex,
      robotsFollow: settings.robotsFollow,
      ogTitle: settings.ogTitle ?? "",
      ogDescription: settings.ogDescription ?? "",
      ogImage: settings.ogImage ?? "",
      showInSitemap: settings.showInSitemap,
    });
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <section className="space-y-4 rounded-[--radius-lg] border border-border bg-surface p-5">
        <div><h1 className="text-2xl font-semibold">Страница цен</h1><p className="text-sm text-foreground-muted">Настройки hero и SEO singleton-страницы.</p></div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2"><Label htmlFor="pricing-h1">H1</Label><Input id="pricing-h1" value={settings.h1} onChange={(e) => update("h1", e.target.value)} /></div>
          <div className="space-y-2 md:col-span-2"><Label htmlFor="pricing-description">Описание</Label><Textarea id="pricing-description" value={settings.description} onChange={(e) => update("description", e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="pricing-seo-title">SEO title</Label><Input id="pricing-seo-title" value={settings.seoTitle ?? ""} onChange={(e) => update("seoTitle", e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="pricing-canonical">Canonical</Label><Input id="pricing-canonical" value={settings.canonical ?? ""} onChange={(e) => update("canonical", e.target.value)} /></div>
          <div className="space-y-2 md:col-span-2"><Label htmlFor="pricing-seo-description">SEO description</Label><Textarea id="pricing-seo-description" value={settings.seoDescription ?? ""} onChange={(e) => update("seoDescription", e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="pricing-og-title">OG title</Label><Input id="pricing-og-title" value={settings.ogTitle ?? ""} onChange={(e) => update("ogTitle", e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="pricing-og-description">OG description</Label><Input id="pricing-og-description" value={settings.ogDescription ?? ""} onChange={(e) => update("ogDescription", e.target.value)} /></div>
          <div className="space-y-2 md:col-span-2"><Label htmlFor="pricing-og-image">OG image URL</Label><Input id="pricing-og-image" value={settings.ogImage ?? ""} onChange={(e) => update("ogImage", e.target.value)} /></div>
        </div>
        <div className="flex flex-wrap gap-5 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={settings.robotsIndex} onChange={(e) => update("robotsIndex", e.target.checked)} /> Индексировать</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={settings.robotsFollow} onChange={(e) => update("robotsFollow", e.target.checked)} /> Следовать ссылкам</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={settings.showInSitemap} onChange={(e) => update("showInSitemap", e.target.checked)} /> В sitemap</label>
        </div>
        <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Сохранение…" : "Сохранить"}</Button>
      </section>
    </form>
  );
}
