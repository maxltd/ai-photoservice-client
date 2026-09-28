import Image from "next/image";
import Link from "next/link";
import { ImageIcon, Ticket } from "lucide-react";
import type { PresetListItemResponse } from "@/lib/api/contract";

interface PresetCardProps {
  preset: PresetListItemResponse;
}

export function PresetCard({ preset }: PresetCardProps) {
  return (
    <Link
      href={`/app/create/${preset.slug}`}
      className="group relative block h-[180px] w-[120px] shrink-0 overflow-hidden rounded-[--radius-md] border border-white/10 bg-[--color-surface]"
    >
      {preset.previewUrl ? (
        <Image
          src={preset.previewUrl}
          alt={preset.title}
          fill
          unoptimized
          className="object-cover transition duration-300 group-hover:scale-[1.03]"
          sizes="120px"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[--color-foreground-muted]">
          <ImageIcon className="h-5 w-5" />
        </div>
      )}

      <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-[--color-token] backdrop-blur-sm">
        <Ticket className="h-3 w-3" />
        {preset.tokenCost}
      </span>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-black/0 p-2">
        <p className="line-clamp-2 text-[11px] font-medium leading-tight text-[--color-foreground]">
          {preset.title}
        </p>
      </div>
    </Link>
  );
}
