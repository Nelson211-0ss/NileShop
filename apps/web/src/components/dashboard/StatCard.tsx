import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardTrend {
  value: number;
  positiveIsGood?: boolean;
}

type StatCardTone = 'primary' | 'accent' | 'plain';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  trend?: StatCardTrend;
  tone?: StatCardTone;
  className?: string;
}

const TONE_STYLES: Record<StatCardTone, { card: string; badge: string }> = {
  primary: { card: 'bg-secondary/70', badge: 'bg-primary text-primary-foreground' },
  accent: { card: 'bg-accent/10', badge: 'bg-accent text-white' },
  plain: { card: 'bg-card', badge: 'bg-secondary text-primary' },
};

export function StatCard({ label, value, icon: Icon, hint, trend, tone = 'plain', className }: StatCardProps) {
  const isPositive = (trend?.value ?? 0) >= 0;
  const isGood = trend ? (trend.positiveIsGood ?? true) === isPositive : true;
  const styles = TONE_STYLES[tone];

  return (
    <div className={cn('border border-border p-3.5 transition-colors hover:border-foreground/15', styles.card, className)}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-md', styles.badge)}>
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
        <p className="text-xl font-bold tracking-tight text-foreground">{value}</p>
        {trend && (
          <span
            className={cn(
              'mb-0.5 flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold',
              isGood ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700',
            )}
          >
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(trend.value).toFixed(1)}%
          </span>
        )}
      </div>
      {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function StatGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4', className)}>{children}</div>;
}
