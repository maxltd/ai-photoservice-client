"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/common/ConfirmDialog";
import { useAdminHomepageFaq, useDeleteHomepageFaq, useReorderHomepageFaq } from "@/lib/hooks/homepage/useHomepageFaq";
import type { HomepageFaqResponse } from "@/lib/api/contract";

export function HomepageFaqList({ initialData }: { initialData: HomepageFaqResponse[] }): React.JSX.Element {
  useAdminHomepageFaq({ data: initialData });
  const [items, setItems] = useState(initialData);
  const [target, setTarget] = useState<HomepageFaqResponse | null>(null);
  const remove = useDeleteHomepageFaq();
  const reorder = useReorderHomepageFaq();


  function move(index: number, offset: -1 | 1): void {
    const nextIndex = index + offset;
    if (nextIndex < 0 || nextIndex >= items.length || reorder.isPending) return;
    const next = [...items];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    next.forEach((item, itemIndex) => { item.sortOrder = itemIndex; });
    setItems(next);
    void reorder.mutateAsync({ items: next.map((item, itemIndex) => ({ id: item.id, sortOrder: itemIndex })) });
  }

  return (
    <div className="space-y-5 p-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">FAQ главной страницы</h1>
          <p className="mt-1 text-sm text-foreground-muted">Вопросы и ответы, отображаемые на главной странице.</p>
        </div>
        <Button asChild><Link href="/admin/homepage/faq/new">Новый вопрос</Link></Button>
      </header>
      {items.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface p-8 text-center text-foreground-muted">FAQ пока не настроен.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border"><tr><th className="p-4">Вопрос</th><th className="p-4">Ответ</th><th className="p-4">Порядок</th><th className="p-4" /></tr></thead>
            <tbody>{items.map((item, index) => (
              <tr key={item.id} className="border-b border-border/60">
                <td className="p-4"><Link className="hover:text-secondary" href={`/admin/homepage/faq/${item.id}/edit`}>{item.question}</Link></td>
                <td className="max-w-xl truncate p-4">{item.answer}</td>
                <td className="p-4">{index + 1}</td>
                <td className="p-4"><div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" disabled={index === 0 || reorder.isPending} onClick={() => move(index, -1)} aria-label="Переместить вверх"><ArrowUp /></Button>
                  <Button variant="ghost" size="icon" disabled={index === items.length - 1 || reorder.isPending} onClick={() => move(index, 1)} aria-label="Переместить вниз"><ArrowDown /></Button>
                  <Button variant="ghost" onClick={() => setTarget(item)}>Удалить</Button>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      <ConfirmDialog open={Boolean(target)} onOpenChange={(open) => { if (!open) setTarget(null); }} title="Удалить FAQ?" description={items.length === 1 ? "Последний вопрос удалить нельзя." : "Вопрос будет удалён через soft delete."} confirmLabel="Удалить" isLoading={remove.isPending} onConfirm={() => { if (target && items.length > 1) void remove.mutateAsync(target.id).then(() => setTarget(null)); }} />
    </div>
  );
}
