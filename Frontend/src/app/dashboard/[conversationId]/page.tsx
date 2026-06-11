import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useConversations } from '../../../features/conversations/hooks/useConversations';
import { useConversationMessages } from '../../../features/conversations/hooks/useConversationMessages';
import { MessageComposer } from '../../../features/messages/components/MessageComposer';
import { MessageList } from '../../../features/messages/components/MessageList';

export function ChatPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { conversationId } = useParams<{ conversationId: string }>();
  const { data: conversations } = useConversations();
  const {
    data: messages,
    isLoading,
    isError,
  } = useConversationMessages(conversationId);

  const conversation = conversations?.find((item) => item.id === conversationId);

  if (!conversationId) {
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
            {conversation?.recipientName ?? t('chat.loadingMessages')}
          </h2>
        </div>
      </div>

      <MessageList
        messages={messages ?? []}
        isLoading={isLoading}
        isError={isError}
      />

      <MessageComposer conversationId={conversationId} />
    </div>
  );
}
