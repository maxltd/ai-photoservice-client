"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSaveHomepageTestimonial } from "@/lib/hooks/homepage/useHomepageTestimonials";
import type { AdminHomepageTestimonialResponse } from "@/lib/api/contract";

export function HomepageTestimonialEditor({
  initial,
}: {
  initial?: AdminHomepageTestimonialResponse;
}): React.JSX.Element {
  const router = useRouter();
  const save = useSaveHomepageTestimonial();
  const [authorName, setAuthorName] = useState(initial?.authorName ?? "");
  const [text, setText] = useState(initial?.text ?? "");
  const [rating, setRating] = useState(String(initial?.rating ?? 5));
  const [isVisible, setIsVisible] = useState(initial?.isVisible ?? true);

  function submit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!authorName.trim() || !text.trim()) return;
    void save.mutateAsync({
      id: initial?.id,
      body: { authorName, text, rating: Number(rating), isVisible },
    }).then(() => {
      router.push("/admin/homepage/testimonials");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-6 p-6">
      <header><h1 className="text-2xl font-semibold">{initial ? "Редактировать отзыв" : "Новый отзыв"}</h1><p className="mt-1 text-sm text-foreground-muted">Отзыв будет отображаться в карусели на главной странице.</p></header>
      <section className="space-y-4 rounded-xl border border-border bg-surface p-5">
        <label className="block space-y-2 text-sm">Имя автора<Input value={authorName} onChange={(event) => setAuthorName(event.target.value)} maxLength={120} required /></label>
        <label className="block space-y-2 text-sm">Текст отзыва<Textarea value={text} onChange={(event) => setText(event.target.value)} maxLength={2000} rows={8} required /></label>
        <label className="block space-y-2 text-sm">Рейтинг (1–5)<Input type="number" min={1} max={5} value={rating} onChange={(event) => setRating(event.target.value)} required /></label>
        <label className="flex gap-2 text-sm"><input type="checkbox" checked={isVisible} onChange={(event) => setIsVisible(event.target.checked)} /> Показывать на главной</label>
      </section>
      <Button disabled={save.isPending} type="submit">{save.isPending ? "Сохранение…" : "Сохранить"}</Button>
    </form>
  );
}
