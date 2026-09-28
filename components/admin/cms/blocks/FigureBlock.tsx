"use client";

import { ImageUpload } from "@/components/admin/common/ImageUpload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { MediaEntityType } from "@/lib/api/contract";

export interface FigureData {
  url: string;
  alt: string;
  title?: string;
  caption: string;
  showInImageSitemap?: boolean;
}

interface FigureBlockProps {
  entityId: string;
  data: FigureData;
  onChange: (next: FigureData) => void;
}

export function FigureBlock({ entityId, data, onChange }: FigureBlockProps) {
  return (
    <div className="space-y-3">
      <ImageUpload
        value={data.url || undefined}
        entityType={MediaEntityType.CMS}
        entityId={entityId}
        label="Иллюстрация"
        previewSize="184x260"
        onChange={(_assetId, publicUrl) =>
          onChange({
            ...data,
            url: publicUrl ?? data.url,
          })
        }
        onClear={() => onChange({ ...data, url: "" })}
      />

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <Label>ALT</Label>
          <Input
            value={data.alt}
            onChange={(event) => onChange({ ...data, alt: event.target.value })}
            placeholder="Описание изображения"
          />
        </div>
        <div className="space-y-2">
          <Label>TITLE (опционально)</Label>
          <Input
            value={data.title ?? ""}
            onChange={(event) =>
              onChange({
                ...data,
                title: event.target.value.trim() || undefined,
              })
            }
            placeholder="Заголовок"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Подпись</Label>
        <Textarea
          rows={2}
          value={data.caption}
          onChange={(event) => onChange({ ...data, caption: event.target.value })}
          placeholder="Подпись с источником/автором"
        />
      </div>

      <div className="flex items-center justify-between rounded-md border border-border p-3">
        <Label>Показывать в image-sitemap</Label>
        <Switch
          checked={data.showInImageSitemap ?? true}
          onCheckedChange={(checked) =>
            onChange({ ...data, showInImageSitemap: checked })
          }
        />
      </div>
    </div>
  );
}
