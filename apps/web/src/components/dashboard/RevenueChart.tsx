import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCurrency } from '@nileshop/utils';
import type { SalesReportPoint } from '@nileshop/types';

interface RevenueChartProps {
  data: SalesReportPoint[];
  height?: number;
}

export function RevenueChart({ data, height = 240 }: RevenueChartProps) {
  const points = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.25} />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--color-border)" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
          minTickGap={24}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
          tickFormatter={(v: number) => formatCurrency(v)}
          width={70}
        />
        <Tooltip
          formatter={(value) => formatCurrency(Number(value))}
          contentStyle={{
            borderRadius: 12,
            borderColor: 'var(--color-border)',
            fontSize: 13,
          }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="var(--color-primary)"
          strokeWidth={2}
          fill="url(#revenueFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
