import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="py-10 text-center">
      <Icon className="mx-auto mb-3 h-8 w-8 text-muted-foreground/60" />
      <p className="font-medium">{title}</p>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ListShell({ children }: { children: ReactNode }) {
  return <div className="divide-y divide-border">{children}</div>;
}

export function ListRow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`py-4 first:pt-0 last:pb-0 ${className ?? ''}`}>{children}</div>;
}
