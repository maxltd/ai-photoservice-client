import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
}

export function StatsCard({ title, value, description, icon: Icon, trend }: StatsCardProps) {
  const trendColor = trend ? (trend.value >= 0 ? 'text-success' : 'text-danger') : 'text-foreground-muted';

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-foreground-muted">{title}</CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold text-foreground">{value}</p>
        {description ? <CardDescription className="mt-2">{description}</CardDescription> : null}
        {trend ? (
          <p className="mt-2 text-xs">
            <span className={trendColor}>{trend.value >= 0 ? '+' : ''}{trend.value}</span>{' '}
            <span className="text-foreground-muted">{trend.label}</span>
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
