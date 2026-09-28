import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline';
}

const variants: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-primary/10 text-primary border border-primary/40',
  secondary: 'bg-white/5 text-foreground-muted border border-border',
  outline: 'border border-border text-foreground-muted',
};

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', variants[variant], className)} {...props} />
  );
}
