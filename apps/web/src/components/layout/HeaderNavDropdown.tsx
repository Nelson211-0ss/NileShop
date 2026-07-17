import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NavDropdownItem {
  label: string;
  to: string;
}

interface HeaderNavDropdownProps {
  label: string;
  to: string;
  items: NavDropdownItem[];
  loading?: boolean;
  viewAllLabel?: string;
}

export function HeaderNavDropdown({ label, to, items, loading, viewAllLabel }: HeaderNavDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();

  const show = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };

  const scheduleHide = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );

  return (
    <div ref={ref} className="relative" onMouseEnter={show} onMouseLeave={scheduleHide}>
      <Link
        to={to}
        onFocus={show}
        aria-expanded={open}
        className="group relative flex items-center gap-1 px-1 py-2 text-sm font-medium text-primary-foreground/85 transition-colors hover:text-primary-foreground"
      >
        {label}
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-200', open && 'rotate-180')} />
        <span className="pointer-events-none absolute inset-x-0 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full bg-accent transition-transform duration-200 ease-out group-hover:scale-x-100" />
      </Link>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-sm border border-border bg-card py-1 text-foreground shadow-xl"
          >
            {loading ? (
              <p className="px-3 py-1.5 text-xs text-muted-foreground">Loading…</p>
            ) : items.length === 0 ? (
              <p className="px-3 py-1.5 text-xs text-muted-foreground">No options available</p>
            ) : (
              items.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-1.5 text-[13px] font-medium leading-tight text-foreground transition-colors hover:bg-muted hover:text-primary"
                >
                  {item.label}
                </Link>
              ))
            )}
            {viewAllLabel && (
              <>
                <div className="my-0.5 border-t border-border" />
                <Link
                  to={to}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-1.5 text-[13px] font-semibold text-primary transition-colors hover:bg-muted"
                >
                  {viewAllLabel}
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
