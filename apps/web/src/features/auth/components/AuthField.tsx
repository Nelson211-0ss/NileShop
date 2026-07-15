import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  icon: LucideIcon;
  label: string;
  error?: string;
}

export const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(
  ({ icon: Icon, label, error, type, className, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="space-y-1.5">
        <label htmlFor={id} className="sr-only">
          {label}
        </label>
        <div className="relative">
          <Icon className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
          <input
            ref={ref}
            id={id}
            type={inputType}
            placeholder={label}
            className={cn(
              'h-12 w-full rounded-xl border-0 bg-muted/60 py-3 pl-11 pr-4 text-sm text-foreground shadow-none outline-none ring-1 ring-transparent transition-all placeholder:text-muted-foreground focus:bg-muted focus:ring-2 focus:ring-accent',
              isPassword && 'pr-11',
              error && 'ring-2 ring-destructive/50',
              className,
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
            </button>
          )}
        </div>
        {error && <p className="pl-1 text-xs font-medium text-destructive">{error}</p>}
      </div>
    );
  },
);
AuthField.displayName = 'AuthField';
