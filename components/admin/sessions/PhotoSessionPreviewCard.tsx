import Image from "next/image";
import { ImageIcon, Star, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PhotoSessionPreviewCardProps {
  title: string;
  previewUrl?: string;
  categoryName?: string;
  tokenCostPerSlot: number;
  slotsCount: number;
  featured: boolean;
  popular: boolean;
}

export function PhotoSessionPreviewCard({
  title,
  previewUrl,
  categoryName,
  tokenCostPerSlot,
  slotsCount,
  featured,
  popular,
}: PhotoSessionPreviewCardProps) {
  const totalCost = tokenCostPerSlot * slotsCount;

  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-wider text-foreground-muted">
        Так фотосессия будет выглядеть в каталоге
      </p>

      <div className="max-w-80 overflow-hidden rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface]">
        <div className="relative aspect-[4/3] border-b border-[--color-border] bg-background">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt={title || "Photo session preview"}
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[--color-foreground-muted]">
              <ImageIcon className="h-6 w-6" />
            </div>
          )}

          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {featured ? (
              <Badge className="border-[--color-warning]/30 bg-[--color-warning]/10 text-[--color-warning]">
                <Star className="mr-1 h-3 w-3" />
                Featured
              </Badge>
            ) : null}
            {popular ? (
              <Badge className="border-[--color-primary]/30 bg-[--color-primary]/10 text-[--color-primary]">
                Популярная
              </Badge>
            ) : null}
          </div>
        </div>

        <div className="space-y-2 p-4">
          <p className="font-medium text-foreground">
            {title || "Без названия"}
          </p>
          <p className="text-sm text-foreground-muted">
            {categoryName || "Без категории"}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-transparent bg-[--color-primary]/10 text-[--color-primary]">
              <Zap className="mr-1 h-3 w-3" />
              {tokenCostPerSlot} / слот
            </Badge>
            <Badge variant="outline">{slotsCount} слотов</Badge>
          </div>
          <div className="mt-2 border-t border-[--color-border] pt-2 text-sm text-[--color-foreground-muted]">
            Итого: {totalCost} токенов
          </div>
        </div>
      </div>
    </div>
  );
}
