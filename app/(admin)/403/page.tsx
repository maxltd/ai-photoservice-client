import Link from 'next/link';
import { ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-background p-6 flex items-center justify-center">
      <div className="w-full max-w-xl rounded-lg border border-border bg-surface p-10 text-center">
        <ShieldX className="mx-auto mb-4 h-12 w-12 text-danger" />
        <h1 className="text-3xl font-bold text-foreground">403</h1>
        <p className="mt-2 text-lg text-foreground">Недостаточно прав доступа</p>
        <p className="mt-2 text-sm text-foreground-muted">Эта страница доступна только администраторам или контент-менеджерам.</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button asChild variant="outline">
            <Link href="/">На главную</Link>
          </Button>
          <Button asChild>
            <Link href="/admin">В админ-панель</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
