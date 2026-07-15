import { useNavigate } from 'react-router-dom';
import { LogOut, Menu, Search, User as UserIcon } from 'lucide-react';
import type { User as AuthUser } from '@nileshop/types';
import { authApi } from '@/features/auth/api/authApi';
import { logout } from '@/store/authSlice';
import { useAppDispatch } from '@/store/hooks';
import { NotificationBell } from '@/components/dashboard/NotificationBell';
import { ThemeToggle } from '@/components/dashboard/ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AppTopbarProps {
  title: string;
  user: AuthUser | null;
  onMenuClick: () => void;
}

export function AppTopbar({ title, user, onMenuClick }: AppTopbarProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authApi.logout();
    dispatch(logout());
    navigate('/');
  };

  const initial = user?.name?.trim().charAt(0).toUpperCase() || 'U';

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-card px-4 py-3 sm:gap-4 sm:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <h1 className="hidden shrink-0 font-display text-xl font-bold text-foreground lg:block">{title}</h1>

      <div className="relative min-w-0 flex-1 sm:max-w-sm">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search stock, order, etc"
          className="h-10 w-full rounded-full border-0 bg-muted/70 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1.5">
        <NotificationBell />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2.5 transition-colors hover:bg-muted">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {initial}
                </span>
              )}
              <span className="hidden text-left leading-tight sm:block">
                <span className="block text-sm font-semibold text-foreground">{user?.name ?? 'Guest'}</span>
                <span className="block text-xs capitalize text-muted-foreground">
                  {user?.roles?.[0]?.replace('_', ' ') ?? ''}
                </span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => navigate('/account')}>
              <UserIcon className="h-4 w-4 text-muted-foreground" />
              My account
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="h-4 w-4 text-muted-foreground" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
