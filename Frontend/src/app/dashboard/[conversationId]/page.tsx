import { useTranslation } from 'react-i18next';

export function ChatPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col bg-white p-8 shadow-sm">
      <h1 className="text-xl font-semibold">{t('dashboard.chatTitle')}</h1>
      <p className="mt-4 text-sm text-slate-500">{t('dashboard.chatTodo')}</p>
    </div>
  );
}
