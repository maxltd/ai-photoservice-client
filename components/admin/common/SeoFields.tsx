"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
  useWatch,
} from "react-hook-form";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface SeoFieldsProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  namePrefix?: string;
  collapsible?: boolean;
}

type SeoFieldKey =
  | "seoTitle"
  | "seoDescription"
  | "canonical"
  | "ogTitle"
  | "ogImage"
  | "twitterCard"
  | "jsonLd";

function withPrefix(prefix: string, key: SeoFieldKey): string {
  return prefix ? `${prefix}.${key}` : key;
}

export function SeoFields<TFieldValues extends FieldValues>({
  control,
  namePrefix = "",
  collapsible = true,
}: SeoFieldsProps<TFieldValues>) {
  const [open, setOpen] = useState(false);

  const title = useWatch({
    control,
    name: withPrefix(namePrefix, "seoTitle") as FieldPath<TFieldValues>,
  }) as string | undefined;

  const description = useWatch({
    control,
    name: withPrefix(namePrefix, "seoDescription") as FieldPath<TFieldValues>,
  }) as string | undefined;

  const ogTitle = useWatch({
    control,
    name: withPrefix(namePrefix, "ogTitle") as FieldPath<TFieldValues>,
  }) as string | undefined;

  const twitterCard = useWatch({
    control,
    name: withPrefix(namePrefix, "twitterCard") as FieldPath<TFieldValues>,
  }) as string | undefined;

  const counters = useMemo(
    () => ({
      title: `${title?.length ?? 0}/120`,
      description: `${description?.length ?? 0}/320`,
      ogTitle: `${ogTitle?.length ?? 0}/120`,
      twitterCard: `${twitterCard?.length ?? 0}/40`,
    }),
    [description, ogTitle, title, twitterCard],
  );

  const content = (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>SEO title</Label>
            <span className="text-xs text-foreground-muted">
              {counters.title}
            </span>
          </div>
          <Controller
            control={control}
            name={withPrefix(namePrefix, "seoTitle") as FieldPath<TFieldValues>}
            render={({ field }) => (
              <Input
                {...field}
                value={typeof field.value === "string" ? field.value : ""}
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>OG title</Label>
            <span className="text-xs text-foreground-muted">
              {counters.ogTitle}
            </span>
          </div>
          <Controller
            control={control}
            name={withPrefix(namePrefix, "ogTitle") as FieldPath<TFieldValues>}
            render={({ field }) => (
              <Input
                {...field}
                value={typeof field.value === "string" ? field.value : ""}
              />
            )}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>SEO description</Label>
          <span className="text-xs text-foreground-muted">
            {counters.description}
          </span>
        </div>
        <Controller
          control={control}
          name={
            withPrefix(namePrefix, "seoDescription") as FieldPath<TFieldValues>
          }
          render={({ field }) => (
            <Textarea
              {...field}
              value={typeof field.value === "string" ? field.value : ""}
            />
          )}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Canonical URL</Label>
          <Controller
            control={control}
            name={
              withPrefix(namePrefix, "canonical") as FieldPath<TFieldValues>
            }
            render={({ field }) => (
              <Input
                {...field}
                value={typeof field.value === "string" ? field.value : ""}
              />
            )}
          />
        </div>
        <div className="space-y-2">
          <Label>OG image URL</Label>
          <Controller
            control={control}
            name={withPrefix(namePrefix, "ogImage") as FieldPath<TFieldValues>}
            render={({ field }) => (
              <Input
                {...field}
                value={typeof field.value === "string" ? field.value : ""}
              />
            )}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Twitter Card</Label>
          <span className="text-xs text-foreground-muted">
            {counters.twitterCard}
          </span>
        </div>
        <Controller
          control={control}
          name={
            withPrefix(namePrefix, "twitterCard") as FieldPath<TFieldValues>
          }
          render={({ field }) => (
            <Input
              {...field}
              value={typeof field.value === "string" ? field.value : ""}
            />
          )}
        />
      </div>

      <div className="space-y-2">
        <Label>JSON-LD</Label>
        <Controller
          control={control}
          name={withPrefix(namePrefix, "jsonLd") as FieldPath<TFieldValues>}
          render={({ field }) => (
            <Textarea
              {...field}
              value={typeof field.value === "string" ? field.value : ""}
              className="min-h-40"
            />
          )}
        />
      </div>
    </div>
  );

  if (!collapsible) {
    return <div className="space-y-2">{content}</div>;
  }

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="rounded-lg border border-border bg-surface"
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-left">
        <div>
          <h3 className="text-sm font-medium text-foreground">SEO-поля</h3>
          <p className="text-xs text-foreground-muted">
            Опциональные мета-данные для страницы
          </p>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-foreground-muted transition-transform",
            open ? "rotate-180" : "",
          )}
        />
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-4 border-t border-border p-4">
        {content}
      </CollapsibleContent>
    </Collapsible>
  );
}
