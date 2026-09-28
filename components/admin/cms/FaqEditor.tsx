"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAutoSave, type SaveStatus } from "@/lib/hooks/useAutoSave";
import type { FaqPageContent } from "@/lib/api/contract";

interface FaqEditorProps {
  entityId: string;
  initialContent: unknown;
  onSave: (content: FaqPageContent) => Promise<unknown>;
  onStatusChange: (status: SaveStatus) => void;
  onContentChange: (content: FaqPageContent) => void;
}

function parseContent(value: unknown): FaqPageContent {
  if (!value || typeof value !== "object") {
    return { description: "", items: [{ question: "", answer: "" }] };
  }
  const source = value as { description?: unknown; items?: unknown };
  const items = Array.isArray(source.items)
    ? source.items.map((item) => {
        const faqItem = item as { question?: unknown; answer?: unknown };
        return {
          question: typeof faqItem.question === "string" ? faqItem.question : "",
          answer: typeof faqItem.answer === "string" ? faqItem.answer : "",
        };
      })
    : [];
  return {
    description: typeof source.description === "string" ? source.description : "",
    items: items.length > 0 ? items : [{ question: "", answer: "" }],
  };
}

export function FaqEditor({
  entityId,
  initialContent,
  onSave,
  onStatusChange,
  onContentChange,
}: FaqEditorProps) {
  const [content, setContent] = useState<FaqPageContent>(() => parseContent(initialContent));
  const { status } = useAutoSave({
    value: content,
    onSave,
    delay: 800,
  });

  useEffect(() => onStatusChange(status), [onStatusChange, status]);

  function update(next: FaqPageContent): void {
    setContent(next);
    onContentChange(next);
  }

  function updateItem(index: number, field: "question" | "answer", value: string): void {
    update({
      ...content,
      items: content.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    });
  }

  function moveItem(from: number, to: number): void {
    if (to < 0 || to >= content.items.length) return;
    const items = [...content.items];
    const [item] = items.splice(from, 1);
    if (!item) return;
    items.splice(to, 0, item);
    update({ ...content, items });
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor={`${entityId}-description`}>Описание hero</Label>
        <Textarea
          id={`${entityId}-description`}
          className="min-h-48"
          value={content.description}
          onChange={(event) => update({ ...content, description: event.target.value })}
          placeholder="Например: <p>Описание страницы</p><h2>Заголовок раздела</h2>"
        />
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <Label>Вопросы и ответы</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => update({ ...content, items: [...content.items, { question: "", answer: "" }] })}
          >
            <Plus className="mr-2 h-4 w-4" /> Добавить
          </Button>
        </div>
        {content.items.map((item, index) => (
          <div key={`${entityId}-faq-${index}`} className="space-y-3 rounded-[--radius-md] border border-border bg-surface p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-foreground-muted">Вопрос {index + 1}</span>
              <div className="flex gap-1">
                <Button type="button" variant="ghost" size="icon" disabled={index === 0} onClick={() => moveItem(index, index - 1)} aria-label="Переместить выше">
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" disabled={index === content.items.length - 1} onClick={() => moveItem(index, index + 1)} aria-label="Переместить ниже">
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" disabled={content.items.length === 1} onClick={() => update({ ...content, items: content.items.filter((_, itemIndex) => itemIndex !== index) })} aria-label="Удалить вопрос">
                  <Trash2 className="h-4 w-4 text-danger" />
                </Button>
              </div>
            </div>
            <Input value={item.question} onChange={(event) => updateItem(index, "question", event.target.value)} placeholder="Вопрос" aria-label={`Вопрос ${index + 1}`} />
            <Textarea value={item.answer} onChange={(event) => updateItem(index, "answer", event.target.value)} placeholder="Ответ" aria-label={`Ответ ${index + 1}`} />
          </div>
        ))}
        <p className="text-xs text-foreground-muted">Нельзя сохранить FAQ без описания и хотя бы одной заполненной пары.</p>
      </div>
    </div>
  );
}
