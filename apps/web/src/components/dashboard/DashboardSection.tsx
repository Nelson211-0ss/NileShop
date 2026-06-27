import type { ReactNode } from 'react';

interface DashboardSectionProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function DashboardSection({ title, description, actions, children }: DashboardSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}
