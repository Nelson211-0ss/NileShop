import { cn } from '@/lib/utils';

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-800 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-800 border-blue-200',
  processing: 'bg-blue-50 text-blue-800 border-blue-200',
  shipped: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  delivered: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  completed: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  cancelled: 'bg-red-50 text-red-800 border-red-200',
  rejected: 'bg-red-50 text-red-800 border-red-200',
  draft: 'bg-muted text-muted-foreground border-border',
  published: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  assigned: 'bg-blue-50 text-blue-800 border-blue-200',
  picked_up: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  approved: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  default: 'bg-muted text-foreground border-border',
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const key = status.toLowerCase().replace(/\s+/g, '_');

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium capitalize',
        statusStyles[key] ?? 'bg-muted text-foreground border-border',
        className,
      )}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}
