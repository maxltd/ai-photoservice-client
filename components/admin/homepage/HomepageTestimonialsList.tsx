"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/common/ConfirmDialog";
import {
  useAdminHomepageTestimonials,
  useDeleteHomepageTestimonial,
} from "@/lib/hooks/homepage/useHomepageTestimonials";
import type { AdminHomepageTestimonialResponse } from "@/lib/api/contract";

export function HomepageTestimonialsList({
  initialData,
}: {
  initialData: AdminHomepageTestimonialResponse[];
}): React.JSX.Element {
  const query = useAdminHomepageTestimonials({ data: initialData });
  const testimonials = query.data?.data ?? initialData;
  const remove = useDeleteHomepageTestimonial();
  const [target, setTarget] = useState<AdminHomepageTestimonialResponse | null>(null);

  return (
    <div className="space-y-5 p-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Отзывы главной страницы</h1>
          <p className="mt-1 text-sm text-foreground-muted">Отзывы, отображаемые в карусели на главной странице.</p>
        </div>
        <Button asChild><Link href="/admin/homepage/testimonials/new">Новый отзыв</Link></Button>
      </header>
      {testimonials.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface p-8 text-center text-foreground-muted">Отзывов пока нет.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border"><tr><th className="p-4">Автор</th><th className="p-4">Текст</th><th className="p-4">Рейтинг</th><th className="p-4">Видимость</th><th className="p-4" /></tr></thead>
            <tbody>{testimonials.map((testimonial) => (
              <tr key={testimonial.id} className="border-b border-border/60">
                <td className="p-4"><Link className="hover:text-secondary" href={`/admin/homepage/testimonials/${testimonial.id}/edit`}>{testimonial.authorName}</Link></td>
                <td className="max-w-xl truncate p-4">{testimonial.text}</td>
                <td className="p-4">{testimonial.rating}/5</td>
                <td className="p-4">{testimonial.isVisible ? "Да" : "Нет"}</td>
                <td className="p-4 text-right"><Button variant="ghost" onClick={() => setTarget(testimonial)}>Удалить</Button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      <ConfirmDialog open={Boolean(target)} onOpenChange={(open) => { if (!open) setTarget(null); }} title="Удалить отзыв?" description="Отзыв будет скрыт через soft delete." confirmLabel="Удалить" isLoading={remove.isPending} onConfirm={() => { if (target) void remove.mutateAsync(target.id).then(() => setTarget(null)); }} />
    </div>
  );
}
