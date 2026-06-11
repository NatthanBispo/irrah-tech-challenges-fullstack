import { useTranslation } from 'react-i18next';
import type { MessageResponse } from '../../../shared/types';
import { useAuth } from '../../auth/context/AuthContext';
import { MessageStatusBadge, STATUS_CONFIG } from './MessageStatusBadge';

interface MessageBubbleProps {
  message: MessageResponse;
}

const TYPE_CONFIG = {
  whatsapp: {
    own: 'bg-green-600 text-white',
    ownMeta: 'text-green-100',
    received: 'bg-green-50 text-green-900 border border-green-100',
    receivedMeta: 'text-green-400',
    badge: 'bg-green-100 text-green-700',
    icon: '💬',
  },
  sms: {
    own: 'bg-blue-600 text-white',
    ownMeta: 'text-blue-100',
    received: 'bg-blue-50 text-blue-900 border border-blue-100',
    receivedMeta: 'text-blue-400',
    badge: 'bg-blue-100 text-blue-700',
    icon: '✉',
  },
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const { t } = useTranslation();
  const { client } = useAuth();
  const isOwnMessage =
    message.sentBy.type === 'client' && message.sentBy.id === client?.id;

  const statusLabel = t(STATUS_CONFIG[message.status].labelKey);
  const type = message.type ?? 'whatsapp';
  const style = TYPE_CONFIG[type] ?? TYPE_CONFIG.whatsapp;

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
          isOwnMessage
            ? `rounded-br-md ${style.own}`
            : `rounded-bl-md ${style.received}`
        }`}
      >
        <p className="whitespace-pre-wrap text-sm">{message.content}</p>
        <div
          className={`mt-1 flex items-center justify-end gap-2 ${
            isOwnMessage ? style.ownMeta : style.receivedMeta
          }`}
        >
          {message.type && (
            <span
              className={`rounded px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${
                isOwnMessage ? 'bg-white/20 text-white' : style.badge
              }`}
            >
              {style.icon}{' '}
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
