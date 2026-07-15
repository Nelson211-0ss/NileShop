import { Area, AreaChart, CartesianGrid, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCurrency } from '@nileshop/utils';
import type { SalesReportPoint } from '@nileshop/types';

interface RevenueChartProps {
  data: SalesReportPoint[];
  height?: number;
}

export function RevenueChart({ data, height = 200 }: RevenueChartProps) {
  const points = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.28} />
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
          yAxisId="revenue"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
          tickFormatter={(v: number) => formatCurrency(v)}
          width={70}
        />
        <YAxis yAxisId="orders" orientation="right" hide />
        <Tooltip
          formatter={(value, name) => [name === 'revenue' ? formatCurrency(Number(value)) : value, name === 'revenue' ? 'Revenue' : 'Orders']}
          contentStyle={{
            borderRadius: 12,
            borderColor: 'var(--color-border)',
            fontSize: 13,
          }}
        />
        <Legend
          formatter={(value) => (value === 'revenue' ? 'Revenue' : 'Orders')}
          iconType="plainline"
          wrapperStyle={{ fontSize: 12 }}
        />
        <Area
          yAxisId="revenue"
          type="monotone"
          dataKey="revenue"
          stroke="var(--color-primary)"
          strokeWidth={2.5}
          fill="url(#revenueFill)"
        />
        <Line
          yAxisId="orders"
          type="monotone"
          dataKey="orders"
          stroke="var(--color-accent)"
          strokeWidth={2}
          strokeDasharray="5 4"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
