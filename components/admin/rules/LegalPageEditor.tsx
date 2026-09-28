"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateCmsPage } from "@/lib/hooks/cms/useCmsAdmin";
import { markdownToHtml } from "@/lib/markdown";
import { sanitizeHtml } from "@/lib/sanitize-html";
import { UnsavedChangesDialog } from "@/components/admin/common/UnsavedChangesDialog";
import { useUnsavedChanges } from "@/lib/hooks/useUnsavedChanges";
import type { CmsPageResponse } from "@/lib/api/contract";

type LegalCmsPage = Omit<CmsPageResponse, "content"> & {
  content: Record<string, unknown> | string;
};

interface LegalPageEditorProps {
  page: LegalCmsPage;
}

export function LegalPageEditor({ page }: LegalPageEditorProps) {
  const router = useRouter();
  const update = useUpdateCmsPage(page.id);
  const initialMarkdown =
    typeof page.content === "string"
      ? page.content
      : page.content && typeof page.content.markdown === "string"
        ? page.content.markdown
        : "";
  const [title, setTitle] = useState(page.title);
  const [description, setDescription] = useState(page.seoDescription ?? "");
  const [h1, setH1] = useState(page.h1);
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const {
    dialogOpen,
    requestNavigation,
    closeDialog,
    confirmNavigation,
  } = useUnsavedChanges(hasUnsavedChanges);


  async function handleSave(): Promise<void> {
    await update.mutateAsync({
      title,
      h1,
      content: { markdown },
      seoTitle: title,
      seoDescription: description,
    });
    setHasUnsavedChanges(false);
    router.refresh();
  }

  return (
    <div
      className="space-y-6"
      onChange={() => setHasUnsavedChanges(true)}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <Button
            variant="ghost"
            onClick={() => requestNavigation(() => router.push("/admin/rules"))}
          >
            ← К правилам
          </Button>
          <h1 className="mt-2 text-2xl font-semibold">{title}</h1>
          <p className="text-sm text-[--color-foreground-muted]">/{page.slug}</p>
        </div>
        <Button onClick={() => void handleSave()} disabled={update.isPending}>
          {update.isPending ? "Сохранение…" : "Сохранить"}
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="space-y-4 rounded-lg border border-border bg-surface p-6">
          <div className="space-y-2">
            <Label htmlFor="legal-title">Title</Label>
            <Input id="legal-title" value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="legal-description">Description</Label>
            <Textarea id="legal-description" value={description} onChange={(event) => setDescription(event.target.value)} rows={4} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="legal-h1">H1</Label>
            <Input id="legal-h1" value={h1} onChange={(event) => setH1(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="legal-markdown">Текст в Markdown</Label>
            <Textarea id="legal-markdown" value={markdown} onChange={(event) => setMarkdown(event.target.value)} rows={28} className="font-mono text-sm" />
          </div>
        </section>

        <section className="rounded-lg border border-border bg-surface p-6">
          <h2 className="mb-4 text-lg font-medium">Предпросмотр</h2>
          <article
            className="legal-prose"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(markdownToHtml(markdown)) }}
          />
        </section>
      </div>
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
