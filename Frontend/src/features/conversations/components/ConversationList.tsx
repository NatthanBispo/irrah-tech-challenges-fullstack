import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { useConversations } from '../hooks/useConversations';
import { ConversationItem } from './ConversationItem';

export function ConversationList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const { data, isLoading, isError } = useConversations();

  useEffect(() => {
    if (isError) {
      toast.error(t('chat.errorConversations'));
    }
  }, [isError, t]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-sm text-slate-500">{t('chat.loadingConversations')}</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-sm text-slate-500">{t('chat.emptyConversations')}</p>
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-sm text-slate-500">{t('chat.emptyConversations')}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {data.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          isActive={conversation.id === conversationId}
          onClick={() => navigate(`/dashboard/${conversation.id}`)}
        />
      ))}
    </div>
  );
}
