"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSaveHomepageFaq } from "@/lib/hooks/homepage/useHomepageFaq";
import type { HomepageFaqResponse } from "@/lib/api/contract";

export function HomepageFaqEditor({ initial }: { initial?: HomepageFaqResponse }): React.JSX.Element {
  const router = useRouter();
  const save = useSaveHomepageFaq();
  const [question, setQuestion] = useState(initial?.question ?? "");
  const [answer, setAnswer] = useState(initial?.answer ?? "");

  function submit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!question.trim() || !answer.trim()) return;
    void save.mutateAsync({ id: initial?.id, body: { question, answer } }).then(() => {
      router.push("/admin/homepage/faq");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">{initial ? "Редактировать FAQ" : "Новый вопрос FAQ"}</h1>
        <p className="mt-1 text-sm text-foreground-muted">Вопрос будет отображаться на главной странице.</p>
      </header>
      <section className="space-y-4 rounded-xl border border-border bg-surface p-5">
        <label className="block space-y-2 text-sm">Вопрос<Input value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={500} required /></label>
        <label className="block space-y-2 text-sm">Ответ<Textarea value={answer} onChange={(event) => setAnswer(event.target.value)} maxLength={5000} rows={8} required /></label>
      </section>
      <Button disabled={save.isPending} type="submit">{save.isPending ? "Сохранение…" : "Сохранить"}</Button>
    </form>
  );
}
