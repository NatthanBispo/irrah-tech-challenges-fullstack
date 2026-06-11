import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useRecipients } from '../../../../features/recipients/hooks/useRecipients';
import { MessageComposer } from '../../../../features/messages/components/MessageComposer';
import { MessageList } from '../../../../features/messages/components/MessageList';

export function NewConversationPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { recipientId } = useParams<{ recipientId: string }>();
  const { data: recipients } = useRecipients();

  const recipient = recipients?.find((item) => item.id === recipientId);

  if (!recipientId) {
    return null;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="rounded-lg px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 md:hidden"
        >
          {t('chat.back')}
        </button>
        <div>
          <h2 className="text-sm font-semibold text-slate-800">
            {recipient?.name ?? t('chat.loadingRecipients')}
          </h2>
        </div>
      </div>

      <MessageList messages={[]} isLoading={false} isError={false} />

      <MessageComposer recipientId={recipientId} />
    </div>
  );
}
