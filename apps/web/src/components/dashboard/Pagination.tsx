import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  page: number;
  total: number;
  perPage: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, total, perPage, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages} · {total} total
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
