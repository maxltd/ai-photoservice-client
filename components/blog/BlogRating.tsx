"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { rateBlogArticle } from "@/lib/hooks/blog/useBlogPublic";
import type { BlogRating } from "@/lib/api/contract";

interface BlogRatingProps {
  slug: string;
  initialRating: BlogRating;
}

export function BlogRating({ slug, initialRating }: BlogRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [rating, setRating] = useState(initialRating);
  const [pending, setPending] = useState(false);

  async function vote(value: number): Promise<void> {
    if (pending) return;
    setPending(true);

    try {
      const next = await rateBlogArticle(slug, value);
      setRating(next.data);
    } finally {
      setPending(false);
    }
  }

  const active = hovered ?? Math.round(rating.average);

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-base leading-6 text-white">Оцените статью</p>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onMouseEnter={() => setHovered(value)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => void vote(value)}
              disabled={pending}
              className="text-secondary"
              aria-label={`Поставить ${value} из 5`}
            >
              <Star className={`h-8 w-8 ${value <= active ? "fill-current" : "text-white/8"}`} />
            </button>
          ))}
        </div>
        <span className="text-xl font-medium leading-7 text-white">
          {rating.average.toFixed(1)}
        </span>
        <span className="text-sm leading-5 text-white/30">/</span>
        <span className="text-xl font-medium leading-7 text-white">5</span>
        <span className="text-sm leading-5 text-white/30">{rating.votes} голосов</span>
      </div>
    </div>
  );
}
