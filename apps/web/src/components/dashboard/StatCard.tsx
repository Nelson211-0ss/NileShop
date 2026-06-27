import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  className?: string;
}

export function StatCard({ label, value, icon: Icon, hint, className }: StatCardProps) {
  return (
    <div className={cn(className)}>
      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
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
