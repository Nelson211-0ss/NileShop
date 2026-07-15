import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function DashboardCard({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('border border-border bg-card', className)}>{children}</div>;
}

export function DashboardCardHeader({
  title,
  action,
  className,
}: {
  title: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-between gap-3 border-b border-border px-4 py-3', className)}>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {action}
    </div>
  );
}

export function DashboardCardContent({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('p-4', className)}>{children}</div>;
}
