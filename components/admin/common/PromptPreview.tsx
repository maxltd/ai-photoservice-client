"use client";

import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  buildPreviewPrompt,
  type LocalParameterGroup,
} from "@/lib/parameter-groups";

interface PromptPreviewProps {
  title?: string;
  basePrompt: string;
  parameterGroups: LocalParameterGroup[];
}

export function PromptPreview({
  title = "Превью промпта",
  basePrompt,
  parameterGroups,
}: PromptPreviewProps) {
  const [selectedOptionByGroup, setSelectedOptionByGroup] = useState<
    Record<string, number>
  >({});

  const normalizedSelected = useMemo(() => {
    const next: Record<string, number> = {};

    for (const group of parameterGroups) {
      const prevIndex = selectedOptionByGroup[group.localId] ?? 0;
      next[group.localId] = Math.min(
        prevIndex,
        Math.max(group.options.length - 1, 0),
      );
    }

    return next;
  }, [parameterGroups, selectedOptionByGroup]);

  const finalPrompt = useMemo(
    () => buildPreviewPrompt(basePrompt, parameterGroups, normalizedSelected),
    [basePrompt, parameterGroups, normalizedSelected],
  );

  const snippets = useMemo(() => {
    return parameterGroups
      .map((group) => {
        const index = normalizedSelected[group.localId] ?? 0;
        return group.options[index]?.promptSnippet?.trim() ?? "";
      })
      .filter((snippet) => snippet.length > 0);
  }, [normalizedSelected, parameterGroups]);

  async function copyPrompt(): Promise<void> {
    await navigator.clipboard.writeText(finalPrompt);
    toast.success("Промпт скопирован");
  }

  return (
    <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-4">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>

      {parameterGroups.length > 0 ? (
        <div className="mt-4 space-y-3">
          {parameterGroups.map((group) => (
            <div key={group.localId} className="space-y-1">
              <p className="text-xs text-foreground-muted">
                {group.question || "Без вопроса"}
              </p>
              <Select
                value={String(normalizedSelected[group.localId] ?? 0)}
                onValueChange={(value) => {
                  const parsed = Number(value);
                  setSelectedOptionByGroup((prev) => ({
                    ...prev,
                    [group.localId]: Number.isNaN(parsed) ? 0 : parsed,
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите вариант" />
                </SelectTrigger>
                <SelectContent>
                  {group.options.map((option, index) => (
                    <SelectItem key={option.localId} value={String(index)}>
                      {option.label || `Вариант ${index + 1}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-4 border-t border-border pt-4">
        <p className="mb-2 text-xs uppercase tracking-wider text-foreground-muted">
          Результат
        </p>
        <div className="flex flex-wrap gap-2 rounded-md border border-border bg-background p-3">
          {basePrompt.trim() ? (
            <span className="rounded-[--radius-sm] bg-white/5 px-2 py-1 text-xs text-foreground">
              [base] {basePrompt.trim()}
            </span>
          ) : null}

          {snippets.map((snippet, index) => (
            <span
              key={`${snippet}-${index}`}
              className="rounded-[--radius-sm] bg-[--color-primary]/10 px-2 py-1 text-xs text-[--color-primary]"
            >
              [snippet] {snippet}
            </span>
          ))}

          {!basePrompt.trim() && snippets.length === 0 ? (
            <span className="text-xs text-foreground-muted">
              Промпт пока пуст
            </span>
          ) : null}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-foreground-muted">
            {finalPrompt.length} символов
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void copyPrompt()}
          >
            <Copy className="h-4 w-4" />
            Копировать
          </Button>
        </div>
      </div>
    </div>
  );
}
