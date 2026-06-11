import { useTranslation } from 'react-i18next';

export function ConversationPlaceholder() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-1 items-center justify-center bg-slate-50 p-8">
      <p className="text-sm text-slate-500">{t('chat.selectConversation')}</p>
    </div>
  );
}
