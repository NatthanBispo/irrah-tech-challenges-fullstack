import { useTranslation } from 'react-i18next';

export function ConversationsPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto min-h-screen max-w-3xl bg-white p-8 shadow-sm">
      <h1 className="text-xl font-semibold">{t('dashboard.conversationsTitle')}</h1>
      <p className="mt-4 text-sm text-slate-500">
        {t('dashboard.conversationsTodo')}
      </p>
    </div>
  );
}
