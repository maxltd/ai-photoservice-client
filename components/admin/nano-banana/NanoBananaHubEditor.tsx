"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/admin/common/PageHeader";
import {
  type NanoBananaHubSettingsResponse,
  type UpdateNanoBananaHubRequest,
} from "@/lib/api/contract";
import { useUpdateNanoBananaHub } from "@/lib/hooks/nano-banana/useNanoBananaPages";
import { useUnsavedChanges } from "@/lib/hooks/useUnsavedChanges";
import { UnsavedChangesDialog } from "@/components/admin/common/UnsavedChangesDialog";

export function NanoBananaHubEditor({
  initialData,
}: {
  initialData: NanoBananaHubSettingsResponse;
}) {
  const router = useRouter();
  const mutation = useUpdateNanoBananaHub();
  const [value, setValue] = useState(initialData);
  const [error, setError] = useState<string | null>(null);
  const patch = (next: Partial<NanoBananaHubSettingsResponse>) =>
    setValue((prev) => ({ ...prev, ...next }));
  async function save() {
    setError(null);
    const required: Array<[string, string]> = [
      [value.h1, "H1"],
      [value.description, "Описание"],
      [value.ctaTitle, "CTA title"],
      [value.ctaDescription, "CTA description"],
      [value.ctaText, "CTA text"],
      [value.ctaHref, "CTA href"],
      [value.seoTitle, "SEO title"],
      [value.seoDescription, "SEO description"],
      [value.ogTitle, "OG title"],
      [value.ogDescription, "OG description"],
    ];
    const missing = required.filter(([field]) => !field.trim()).map(([, label]) => label);
    if (missing.length) {
      setError(`Заполните обязательные поля: ${missing.join(", ")}`);
      return;
    }
    try {
    const body: UpdateNanoBananaHubRequest = {
      h1: value.h1,
      description: value.description,
      ctaTitle: value.ctaTitle,
      ctaDescription: value.ctaDescription,
      ctaText: value.ctaText,
      ctaHref: value.ctaHref,
      seoTitle: value.seoTitle,
      seoDescription: value.seoDescription,
      canonical: value.canonical ?? undefined,
      robotsIndex: value.robotsIndex,
      robotsFollow: value.robotsFollow,
      ogTitle: value.ogTitle,
      ogDescription: value.ogDescription,
      ogImage: value.ogImage ?? undefined,
      showInSitemap: value.showInSitemap,
    };
    await mutation.mutateAsync(body);
    setSavedSnapshot(currentSnapshot);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Не удалось сохранить хаб");
    }
  }
  const currentSnapshot = JSON.stringify(value);
  const [savedSnapshot, setSavedSnapshot] = useState<string>(() => currentSnapshot);
  const isDirty = savedSnapshot !== currentSnapshot;
  const {
    dialogOpen,
    requestNavigation,
    closeDialog,
    confirmNavigation,
  } = useUnsavedChanges(isDirty);
  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Настройки Nano Banana hub"
        description="Singleton-контент публичного хаба"
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() =>
                requestNavigation(() => router.push("/admin/nano-banana"))
              }
            >
              Назад
            </Button>
            <Button onClick={() => void save()} disabled={mutation.isPending}>
              Сохранить
            </Button>
          </div>
        }
      />
      {error ? (
        <p className="rounded-md border border-danger/30 bg-danger/10 p-3 text-danger">
          {error}
        </p>
      ) : null}
      <section className="grid gap-4 rounded-lg border border-border bg-surface p-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label>H1</Label>
          <Input
            value={value.h1}
            onChange={(event) => patch({ h1: event.target.value })}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Description</Label>
          <Textarea
            className="min-h-48"
            value={value.description}
            onChange={(event) => patch({ description: event.target.value })}
            placeholder="Например: <p>Описание страницы</p><h2>Заголовок раздела</h2>"
          />
        </div>
        <div className="space-y-2">
          <Label>CTA title</Label>
          <Input
            value={value.ctaTitle}
            onChange={(event) => patch({ ctaTitle: event.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>CTA text</Label>
          <Input
            value={value.ctaText}
            onChange={(event) => patch({ ctaText: event.target.value })}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>CTA description</Label>
          <Textarea
            className="min-h-48"
            value={value.ctaDescription}
            onChange={(event) => patch({ ctaDescription: event.target.value })}
            placeholder="Например: <p>Описание CTA</p><h2>Дополнительный раздел</h2>"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>CTA href</Label>
          <Input
            value={value.ctaHref}
            onChange={(event) => patch({ ctaHref: event.target.value })}
          />
        </div>
      </section>
      <section className="grid gap-4 rounded-lg border border-border bg-surface p-4 md:grid-cols-2">
        <h2 className="md:col-span-2 text-lg font-medium">
          SEO / Robots / Sitemap
        </h2>
        <Input
          placeholder="SEO title"
          value={value.seoTitle}
          onChange={(event) => patch({ seoTitle: event.target.value })}
        />
        <Input
          placeholder="Canonical"
          value={value.canonical ?? ""}
          onChange={(event) => patch({ canonical: event.target.value })}
        />
        <Textarea
          placeholder="SEO description"
          value={value.seoDescription}
          onChange={(event) => patch({ seoDescription: event.target.value })}
        />
        <Input
          placeholder="OG title"
          value={value.ogTitle}
          onChange={(event) => patch({ ogTitle: event.target.value })}
        />
        <Textarea
          placeholder="OG description"
          value={value.ogDescription}
          onChange={(event) => patch({ ogDescription: event.target.value })}
        />
        <Input
          placeholder="OG image URL"
          value={value.ogImage ?? ""}
          onChange={(event) => patch({ ogImage: event.target.value })}
        />
        <div className="space-y-3 rounded-md border border-border p-3">
          <div className="flex justify-between">
            <Label>Robots index</Label>
            <Switch
              checked={value.robotsIndex}
              onCheckedChange={(checked) => patch({ robotsIndex: checked })}
            />
          </div>
          <div className="flex justify-between">
            <Label>Robots follow</Label>
            <Switch
              checked={value.robotsFollow}
              onCheckedChange={(checked) => patch({ robotsFollow: checked })}
            />
          </div>
          <div className="flex justify-between">
            <Label>Показывать в sitemap</Label>
            <Switch
              checked={value.showInSitemap}
              onCheckedChange={(checked) => patch({ showInSitemap: checked })}
            />
          </div>
        </div>
      </section>
      <UnsavedChangesDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        onLeave={confirmNavigation}
      />
    </div>
  );
}
