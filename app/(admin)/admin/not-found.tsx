import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminNotFoundPage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center justify-center rounded-lg border border-border bg-surface p-10 text-center">
      <h1 className="text-3xl font-bold text-foreground">Страница не найдена</h1>
      <p className="mt-3 text-sm text-foreground-muted">В админ-панели нет запрошенного ресурса.</p>
      <Button asChild className="mt-6">
        <Link href="/admin">Вернуться на Dashboard</Link>
      </Button>
    </div>
  );
}
