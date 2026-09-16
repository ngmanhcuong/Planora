import { useEffect } from 'react';
import type React from 'react';
import { useSettings } from '@/features/settings/hooks/useSettings';

const normalizeTheme = (theme?: string | null): 'light' | 'dark' | 'system' => {
  const value = theme?.toLowerCase();
  return value === 'dark' || value === 'system' ? value : 'light';
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: settings } = useSettings();

  useEffect(() => {
    const root = document.documentElement;
    const selectedTheme = normalizeTheme(settings?.theme);
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const resolvedTheme = selectedTheme === 'system' && mediaQuery.matches ? 'dark' : selectedTheme === 'system' ? 'light' : selectedTheme;
      root.dataset.theme = resolvedTheme;
      root.classList.toggle('dark', resolvedTheme === 'dark');
      root.style.colorScheme = resolvedTheme;
    };

    applyTheme();
    mediaQuery.addEventListener('change', applyTheme);

    return () => mediaQuery.removeEventListener('change', applyTheme);
  }, [settings?.theme]);

  return <>{children}</>;
};
