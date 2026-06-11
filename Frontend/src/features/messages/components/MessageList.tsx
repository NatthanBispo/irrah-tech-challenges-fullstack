import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { MessageResponse } from '../../../shared/types';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  messages: MessageResponse[];
  isLoading: boolean;
  isError: boolean;
}

export function MessageList({ messages, isLoading, isError }: MessageListProps) {
  const { t } = useTranslation();
  const bottomRef = useRef<HTMLDivElement>(null);

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
        <p className="text-sm text-red-600">{t('chat.errorMessages')}</p>
      </div>
    );
  }

  if (!messages.length) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-slate-500">{t('chat.emptyMessages')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
