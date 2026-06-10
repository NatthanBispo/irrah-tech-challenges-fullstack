import { useEffect, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export function RootLayout({ children }: { children: ReactNode }) {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    document.title = t('app.title');
    document.documentElement.lang = i18n.language;
  }, [t, i18n.language]);

  return <>{children}</>;
}
