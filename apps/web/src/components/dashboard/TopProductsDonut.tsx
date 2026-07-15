import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '@nileshop/utils';
import type { TopProduct } from '@nileshop/types';

interface TopProductsDonutProps {
  data: TopProduct[];
}

const COLORS = [
  'var(--color-primary)',
  'var(--color-accent)',
  'oklch(0.7 0.12 250)',
  'oklch(0.82 0.14 60)',
  'oklch(0.6 0.16 250)',
];

export function TopProductsDonut({ data }: TopProductsDonutProps) {
  const top = data.slice(0, 5).map((p) => ({
    name: p.name,
    value: Math.max(p.price * p.total_sales, 0),
    units: p.total_sales,
  }));

  const total = top.reduce((sum, p) => sum + p.value, 0);

  return (
    <div>
      <div className="relative mx-auto h-48 w-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={top}
              dataKey="value"
              nameKey="name"
              innerRadius="70%"
              outerRadius="100%"
              paddingAngle={2}
              stroke="none"
            >
              {top.map((entry, i) => (
                <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              contentStyle={{ borderRadius: 12, borderColor: 'var(--color-border)', fontSize: 13 }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-xs text-muted-foreground">Total sales</p>
          <p className="text-lg font-bold text-foreground">{formatCurrency(total)}</p>
        </div>
      </div>

      <ul className="mt-5 space-y-3">
        {top.map((p, i) => (
          <li key={p.name} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span className="truncate text-foreground">{p.name}</span>
            </span>
            <span className="shrink-0 font-medium text-muted-foreground">{formatCurrency(p.value)}</span>
          </li>
        ))}
        {top.length === 0 && <p className="text-sm text-muted-foreground">No sales data yet.</p>}
      </ul>
    </div>
  );
}
