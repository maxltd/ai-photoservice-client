import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TopContentUsageDto } from '@/lib/api/contract';

interface TopContentTableProps {
  title: string;
  rows: TopContentUsageDto[];
  hrefBuilder: (slug: string) => string;
}

export function TopContentTable({ title, rows, hrefBuilder }: TopContentTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-foreground-muted">
                <th className="py-2 font-medium">#</th>
                <th className="py-2 font-medium">Название</th>
                <th className="py-2 text-right font-medium">Использований</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id} className="border-b border-border/60 last:border-0">
                  <td className="py-3 text-foreground-muted">{index + 1}</td>
                  <td className="py-3">
                    <Link href={hrefBuilder(row.slug)} className="text-foreground hover:text-primary">
                      {row.title}
                    </Link>
                  </td>
                  <td className="py-3 text-right text-foreground">{row.usageCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
