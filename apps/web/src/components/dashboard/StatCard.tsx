import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardTrend {
  value: number;
  positiveIsGood?: boolean;
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  trend?: StatCardTrend;
  className?: string;
}

export function StatCard({ label, value, icon: Icon, hint, trend, className }: StatCardProps) {
  const isPositive = (trend?.value ?? 0) >= 0;
  const isGood = trend ? (trend.positiveIsGood ?? true) === isPositive : true;

  return (
    <div className={cn(className)}>
      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
      {trend && (
        <p
          className={cn(
            'mt-0.5 flex items-center gap-1 text-xs font-medium',
            isGood ? 'text-emerald-600' : 'text-red-600',
          )}
        >
          {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          {Math.abs(trend.value).toFixed(1)}%
        </p>
      )}
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function StatGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {children}
    </div>
  );
}
