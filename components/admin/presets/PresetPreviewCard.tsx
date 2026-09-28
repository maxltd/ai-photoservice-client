import Image from "next/image";
import { ImageIcon, Star, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PresetPreviewCardProps {
  title: string;
  previewUrl?: string;
  categoryName?: string;
  tokenCost: number;
  featured: boolean;
}

export function PresetPreviewCard({
  title,
  previewUrl,
  categoryName,
  tokenCost,
  featured,
}: PresetPreviewCardProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-wider text-foreground-muted">
        Так пресет будет выглядеть в каталоге
      </p>

      <div className="max-w-80 overflow-hidden rounded-lg border border-border bg-surface">
        <div className="relative aspect-[4/3] border-b border-border bg-background">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt={title || "Preset preview"}
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-foreground-muted">
              <ImageIcon className="h-6 w-6" />
            </div>
          )}

          {featured ? (
            <div className="absolute left-2 top-2">
              <Badge className="border-[--color-warning]/30 bg-[--color-warning]/10 text-[--color-warning]">
                <Star className="mr-1 h-3 w-3" />
                Featured
              </Badge>
            </div>
          ) : null}
        </div>

        <div className="space-y-2 p-4">
          <p className="font-medium text-foreground">
            {title || "Без названия"}
          </p>
          <p className="text-sm text-foreground-muted">
            {categoryName || "Без категории"}
          </p>
          <Badge className="border-transparent bg-[--color-primary]/10 text-[--color-primary]">
            <Zap className="mr-1 h-3 w-3" />
            {tokenCost} токенов
          </Badge>
        </div>
      </div>
    </div>
  );
}
