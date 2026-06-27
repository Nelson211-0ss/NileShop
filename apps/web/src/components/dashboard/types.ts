import type { LucideIcon } from 'lucide-react';

export interface DashboardNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}
