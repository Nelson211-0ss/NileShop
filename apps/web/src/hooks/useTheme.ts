import { useCallback, useState } from 'react';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'nileshop_dashboard_theme';

function getInitialTheme(): Theme {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === 'dark' ? 'dark' : 'light';
}

/**
 * Dashboard-scoped theme toggle. The returned `theme` is meant to be applied as a
 * `dark` class on the dashboard's own root element (see AppDashboardLayout) — not on
 * <html> — so it never affects the storefront, which always renders in light mode.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      window.localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
