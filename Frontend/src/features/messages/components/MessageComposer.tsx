import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { MessagePriority, MessageType } from '../../../shared/types';
import { useAuth } from '../../auth/context/AuthContext';
import { useSendMessage } from '../hooks/useSendMessage';

interface MessageComposerProps {
  conversationId?: string;
  recipientId?: string;
}

export function MessageComposer({
  conversationId,
  recipientId,
}: MessageComposerProps) {
  const { t } = useTranslation();
  const { client } = useAuth();
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<MessagePriority>('normal');
  const [messageType, setMessageType] = useState<MessageType>('whatsapp');
  const [error, setError] = useState<string | null>(null);
  const { mutate, isPending } = useSendMessage({ conversationId, recipientId });

  return (
    <form
      className="border-t border-slate-200 bg-white p-4"
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = content.trim();

        if (!trimmed) {
          setError(t('chat.contentRequired'));
          return;
        }

        setError(null);
        mutate(
          { content: trimmed, priority, type: messageType },
          {
            onSuccess: () => setContent(''),
            onError: (err: unknown) => {
              const status =
                typeof err === 'object' &&
                err !== null &&
                'response' in err &&
                (err as { response?: { status?: number } }).response?.status;

              if (status === 402) {
                setError(
                  client?.planType === 'postpaid'
                    ? t('chat.limitExceeded')
                    : t('chat.insufficientBalance'),
                );
                return;
              }

              setError(t('chat.sendError'));
            },
          },
        );
      }}
    >
      <div className="mb-3 flex flex-wrap gap-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
          <input
            type="radio"
            name="priority"
            checked={priority === 'normal'}
            onChange={() => setPriority('normal')}
            disabled={isPending}
          />
          {t('chat.priorityNormal')}
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
          <input
            type="radio"
            name="priority"
            checked={priority === 'urgent'}
            onChange={() => setPriority('urgent')}
            disabled={isPending}
          />
          {t('chat.priorityUrgent')}
        </label>
        <span className="text-slate-300">|</span>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
          <input
            type="radio"
            name="messageType"
            checked={messageType === 'whatsapp'}
            onChange={() => setMessageType('whatsapp')}
            disabled={isPending}
          />
          {t('chat.messageTypeWhatsapp')}
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
          <input
            type="radio"
            name="messageType"
            checked={messageType === 'sms'}
            onChange={() => setMessageType('sms')}
            disabled={isPending}
          />
          {t('chat.messageTypeSms')}
        </label>
      </div>

      <div className="flex items-center gap-2">
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          placeholder={t('chat.messagePlaceholder')}
          rows={2}
          disabled={isPending}
          className="flex-1 resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isPending || !content.trim()}
          aria-label={t('chat.send')}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-40"
        >
          {isPending ? (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : (
            <svg className="h-5 w-5 translate-x-px" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          )}
        </button>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </form>
  );
}
