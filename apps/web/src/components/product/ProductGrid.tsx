import { cn } from '@/lib/utils';

export function ProductGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 [&>*]:min-w-0 [&>*]:h-full',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ProductGrid>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="aspect-square animate-pulse bg-muted" />
          <div className="h-[4.25rem] animate-pulse bg-muted/40" />
        </div>
      ))}
    </ProductGrid>
  );
}
