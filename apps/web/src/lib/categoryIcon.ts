import * as LucideIcons from 'lucide-react';
import { Tag } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export function resolveCategoryIcon(icon?: string | null): LucideIcon {
  if (!icon) return Tag;
  const pascalCase = icon
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
  const resolved = (LucideIcons as unknown as Record<string, LucideIcon>)[pascalCase];
  return resolved ?? Tag;
}
