'use client';

import { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: 'danger' | 'warning';
  requireInput?: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Удалить',
  variant = 'danger',
  requireInput,
  onConfirm,
  isLoading = false,
}: ConfirmDialogProps) {
  const [value, setValue] = useState('');

  const canConfirm = useMemo(() => {
    if (!requireInput) {
      return true;
    }

    return value.trim() === requireInput;
  }, [requireInput, value]);

  function handleOpenChange(nextOpen: boolean): void {
    if (!nextOpen) {
      setValue('');
    }

    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {requireInput ? (
          <div className="space-y-2">
            <p className="text-xs text-foreground-muted">
              Введите <span className="font-medium text-foreground">{requireInput}</span> для подтверждения
            </p>
            <Input value={value} onChange={(event) => setValue(event.target.value)} />
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
            Отмена
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!canConfirm || isLoading}
            className={variant === 'danger' ? 'bg-danger text-foreground hover:bg-danger/90' : ''}
          >
            {isLoading ? 'Выполняется...' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
