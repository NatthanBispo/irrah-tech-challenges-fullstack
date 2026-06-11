import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { MessageResponse, MessageType } from '../../../shared/types';
import { MessageBubble } from './MessageBubble';

type FilterType = 'all' | MessageType;

interface MessageListProps {
  messages: MessageResponse[];
  isLoading: boolean;
  isError: boolean;
}

const FILTER_BUTTONS: { key: FilterType; labelKey: string }[] = [
  { key: 'all', labelKey: 'chat.filterAll' },
  { key: 'whatsapp', labelKey: 'chat.filterWhatsapp' },
  { key: 'sms', labelKey: 'chat.filterSms' },
];

const FILTER_ACTIVE: Record<FilterType, string> = {
  all: 'bg-slate-700 text-white',
  whatsapp: 'bg-green-600 text-white',
  sms: 'bg-blue-600 text-white',
};

export function MessageList({ messages, isLoading, isError }: MessageListProps) {
  const { t } = useTranslation();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    if (isError) {
      toast.error(t('chat.errorMessages'));
    }
  }, [isError, t]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-slate-500">{t('chat.loadingMessages')}</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-slate-500">{t('chat.emptyMessages')}</p>
      </div>
    );
  }

  const filtered =
    filter === 'all' ? messages : messages.filter((m) => m.type === filter);

  const hasTypes = messages.some((m) => m.type);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {hasTypes && (
        <div className="flex items-center gap-1 border-b border-slate-100 px-4 py-2">
          {FILTER_BUTTONS.map(({ key, labelKey }) => {
            const isActive = filter === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  isActive
                    ? FILTER_ACTIVE[key]
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t(labelKey)}
              </button>
            );
          })}
          {filter !== 'all' && (
            <span className="ml-auto text-xs text-slate-400">
              {filtered.length} mensage{filtered.length !== 1 ? 'ns' : 'm'}
            </span>
          )}
        </div>
      )}

      {!filtered.length ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-slate-500">
            {filter === 'all' ? t('chat.emptyMessages') : t('chat.emptyFilteredMessages')}
          </p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
          {filtered.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
