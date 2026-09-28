import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  isVisible: boolean;
  featured?: boolean;
}

export function StatusBadge({ isVisible, featured = false }: StatusBadgeProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant={isVisible ? 'default' : 'secondary'}>
        {isVisible ? 'Видимый' : 'Скрытый'}
      </Badge>
      {featured ? <Badge variant="outline">Рекомендуемый</Badge> : null}
    </div>
  );
}
