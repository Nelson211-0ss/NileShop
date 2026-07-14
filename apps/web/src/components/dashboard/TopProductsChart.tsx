import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TopProduct } from '@nileshop/types';

interface TopProductsChartProps {
  data: TopProduct[];
  height?: number;
}

export function TopProductsChart({ data, height = 320 }: TopProductsChartProps) {
  const points = [...data].reverse();

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={points} layout="vertical" margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid horizontal={false} stroke="var(--color-border)" />
        <XAxis
          type="number"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
        />
        <YAxis
          type="category"
          dataKey="name"
          tickLine={false}
          axisLine={false}
          width={140}
          tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
        />
        <Tooltip
          formatter={(value) => [`${value} sold`, 'Sales']}
          contentStyle={{ borderRadius: 12, borderColor: 'var(--color-border)', fontSize: 13 }}
        />
        <Bar dataKey="total_sales" fill="var(--color-accent)" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
