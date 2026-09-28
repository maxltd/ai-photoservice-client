"use client";

import { ImageUpload } from "@/components/admin/common/ImageUpload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MediaEntityType } from "@/lib/api/contract";

export interface ImageData {
  url: string;
  alt: string;
  title?: string;
}

interface ImageBlockProps {
  data: ImageData;
  entityId: string;
  onChange: (next: ImageData) => void;
}

export function ImageBlock({ data, entityId, onChange }: ImageBlockProps) {
  return (
    <div className="space-y-3">
      <ImageUpload
        value={data.url || undefined}
        entityType={MediaEntityType.CMS}
        entityId={entityId}
        label="Изображение"
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
          <Label>Alt-текст</Label>
          <Input
            value={data.alt}
            onChange={(event) => onChange({ ...data, alt: event.target.value })}
            placeholder="Описание изображения"
          />
        </div>
        <div className="space-y-2">
          <Label>Title (опционально)</Label>
          <Input
            value={data.title ?? ""}
            onChange={(event) =>
              onChange({ ...data, title: event.target.value.trim() || undefined })
            }
            placeholder="Title"
          />
        </div>
      </div>

    </div>
  );
}
