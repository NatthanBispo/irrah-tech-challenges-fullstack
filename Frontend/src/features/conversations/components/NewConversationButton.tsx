import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useRecipients } from '../../recipients/hooks/useRecipients';

export function NewConversationButton() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { data: recipients, isLoading, isError } = useRecipients();

  return (
    <div className="border-b border-slate-200 px-4 py-2">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        {t('chat.newConversation')}
      </button>

      {open && (
        <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white">
          {isLoading && (
            <p className="p-3 text-sm text-slate-500">{t('chat.loadingRecipients')}</p>
          )}
          {isError && (
            <p className="p-3 text-sm text-red-600">{t('chat.errorRecipients')}</p>
          )}
          {recipients?.map((recipient) => (
            <button
              key={recipient.id}
              type="button"
              onClick={() => {
                setOpen(false);
                navigate(`/dashboard/new/${recipient.id}`);
              }}
              className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            >
              {recipient.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
