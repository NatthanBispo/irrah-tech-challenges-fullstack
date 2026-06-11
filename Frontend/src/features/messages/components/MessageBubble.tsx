import { useTranslation } from 'react-i18next';
import type { MessageResponse } from '../../../shared/types';
import { useAuth } from '../../auth/context/AuthContext';
import { MessageStatusBadge, STATUS_CONFIG } from './MessageStatusBadge';

interface MessageBubbleProps {
  message: MessageResponse;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const { t } = useTranslation();
  const { client } = useAuth();
  const isOwnMessage =
    message.sentBy.type === 'client' && message.sentBy.id === client?.id;

  const statusLabel = t(STATUS_CONFIG[message.status].labelKey);

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
          isOwnMessage
            ? 'rounded-br-md bg-blue-600 text-white'
            : 'rounded-bl-md bg-slate-100 text-slate-800'
        }`}
      >
        <p className="whitespace-pre-wrap text-sm">{message.content}</p>
        <div
          className={`mt-1 flex items-center justify-end gap-2 ${
            isOwnMessage ? 'text-blue-100' : 'text-slate-400'
          }`}
        >
          {message.type && (
            <span className="text-[10px] uppercase tracking-wide opacity-70">
              {message.type === 'whatsapp'
                ? t('chat.messageTypeWhatsapp')
                : t('chat.messageTypeSms')}
            </span>
          )}
          <span className="text-[10px]">
            {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {isOwnMessage && (
            <MessageStatusBadge status={message.status} label={statusLabel} />
          )}
        </div>
      </div>
    </div>
  );
}
