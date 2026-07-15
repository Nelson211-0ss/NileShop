import { useRef, useState } from 'react';
import { MoreHorizontal, RefreshCw } from 'lucide-react';
import { useQueryClient, type QueryKey } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CardMenuProps {
  queryKey: QueryKey;
}

/** Three-dot card menu that opens on hover (desktop) as well as click/tap (touch). */
export function CardMenu({ queryKey }: CardMenuProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<number>(undefined);

  const openNow = () => {
    window.clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const closeSoon = () => {
    closeTimer.current = window.setTimeout(() => setOpen(false), 150);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Card options"
          onMouseEnter={openNow}
          onMouseLeave={closeSoon}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent onMouseEnter={openNow} onMouseLeave={closeSoon} className="w-44">
        <DropdownMenuItem onClick={() => queryClient.invalidateQueries({ queryKey })}>
          <RefreshCw className="h-4 w-4 text-muted-foreground" />
          Refresh
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
