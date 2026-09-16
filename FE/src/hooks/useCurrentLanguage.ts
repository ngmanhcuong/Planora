import { normalizeLanguage } from '@/lib/i18n';
import { useSettings } from '@/features/settings/hooks/useSettings';

export const useCurrentLanguage = () => {
  const { data: settings } = useSettings();
  return normalizeLanguage(settings?.language);
};
