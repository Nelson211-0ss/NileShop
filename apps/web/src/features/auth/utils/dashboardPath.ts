import type { UserRole } from '@nileshop/types';

export function dashboardPathForRoles(roles: UserRole[]): string {
  if (roles.includes('administrator')) return '/admin';
  if (roles.includes('vendor')) return '/vendor';
  if (roles.includes('delivery_rider')) return '/rider';
  return '/';
}
