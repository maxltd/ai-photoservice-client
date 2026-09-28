"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import type { DailyStatsDto } from "@/lib/api/contract";

interface ChartTooltipPayload {
  name?: string;
  value?: number | string;
  color?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  label?: string;
  payload?: ChartTooltipPayload[];
}

function OrdersTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="rounded-md border border-border bg-surface p-3 text-xs text-foreground shadow-md">
      <p className="mb-2 text-foreground-muted">{label}</p>
      <div className="space-y-1">
        {payload.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between gap-4"
          >
            <span className="text-foreground-muted">{item.name}</span>
            <span className="font-medium text-foreground">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface OrdersChartProps {
  data: DailyStatsDto[];
}

export function OrdersChart({ data }: OrdersChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Заказы за 30 дней</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="date"
              stroke="var(--color-foreground-muted)"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              stroke="var(--color-foreground-muted)"
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<OrdersTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="ordersCreated"
              name="Создано"
              stroke="#6B46C1"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="ordersCompleted"
              name="Завершено"
              stroke="#22C55E"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="ordersFailed"
              name="С ошибкой"
              stroke="#EF4444"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
