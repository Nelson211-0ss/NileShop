import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function DashboardCard({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('rounded-sm bg-card shadow-sm', className)}>{children}</div>;
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
    <div className={cn('flex items-center justify-between gap-3 border-b border-border px-3.5 py-2.5', className)}>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {action}
    </div>
  );
}

export function DashboardCardContent({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('p-3.5', className)}>{children}</div>;
}
