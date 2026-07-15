import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardTrend {
  value: number;
  positiveIsGood?: boolean;
}

type StatCardTone = 'primary' | 'accent' | 'plain';
type StatCardSize = 'default' | 'sm';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  trend?: StatCardTrend;
  tone?: StatCardTone;
  size?: StatCardSize;
  className?: string;
}

const TONE_STYLES: Record<StatCardTone, { badge: string }> = {
  primary: { badge: 'bg-primary text-primary-foreground' },
  accent: { badge: 'bg-accent text-white' },
  plain: { badge: 'bg-secondary text-primary' },
};

const SIZE_STYLES: Record<StatCardSize, { pad: string; iconWrap: string; icon: string; value: string }> = {
  default: { pad: 'p-3', iconWrap: 'h-7 w-7', icon: 'h-3.5 w-3.5', value: 'text-xl' },
  sm: { pad: 'p-2.5', iconWrap: 'h-6 w-6', icon: 'h-3 w-3', value: 'text-base' },
};

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  trend,
  tone = 'plain',
  size = 'default',
  className,
}: StatCardProps) {
  const isPositive = (trend?.value ?? 0) >= 0;
  const isGood = trend ? (trend.positiveIsGood ?? true) === isPositive : true;
  const styles = TONE_STYLES[tone];
  const sizing = SIZE_STYLES[size];

  return (
    <div
      className={cn(
        'rounded-sm bg-card shadow-sm transition-shadow hover:shadow-md',
        sizing.pad,
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <span className={cn('flex shrink-0 items-center justify-center rounded-md', sizing.iconWrap, styles.badge)}>
          <Icon className={sizing.icon} />
        </span>
      </div>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
        <p className={cn('font-bold tracking-tight text-foreground', sizing.value)}>{value}</p>
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
  return <div className={cn('mb-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4', className)}>{children}</div>;
}
