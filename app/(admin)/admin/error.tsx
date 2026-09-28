'use client';

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminDashboardErrorProps {
  error: Error;
  reset: () => void;
}

export default function AdminDashboardError({ error, reset }: AdminDashboardErrorProps) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center justify-center rounded-lg border border-border bg-surface p-8 text-center">
      <AlertTriangle className="mb-4 h-10 w-10 text-danger" />
      <h2 className="text-xl font-semibold text-foreground">Не удалось загрузить Dashboard</h2>
      <p className="mt-2 text-sm text-foreground-muted">{error.message}</p>
      <Button className="mt-6" onClick={reset}>
        Попробовать снова
      </Button>
    </div>
  );
}
