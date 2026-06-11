import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../features/auth/context/AuthContext';
import { ConversationList } from '../../features/conversations/components/ConversationList';
import { NewConversationButton } from '../../features/conversations/components/NewConversationButton';
import { BillingPanel } from '../../features/billing/components/BillingPanel';
import { formatCents } from '../../shared/utils/money';
import { useMessageSocket } from '../../shared/hooks/useMessageSocket';

export function DashboardLayout() {
  const { t } = useTranslation();
  const { client, logout } = useAuth();
  useMessageSocket();
  const navigate = useNavigate();
  const { conversationId, recipientId } = useParams();
  const showChat = Boolean(conversationId || recipientId);

  return (
    <div className="mx-auto flex h-screen max-w-6xl flex-col bg-white shadow-sm">
      <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">
            {t('app.title')}
          </h1>
          {client && (
            <p className="text-xs text-slate-500">
              {client.name} ·{' '}
              {client.planType === 'prepaid'
                ? t('chat.balance', {
                    value: formatCents(client.balance ?? 0),
                  })
                : t('chat.postpaidUsage', {
                    usage: formatCents(client.monthlyUsage ?? 0),
                    limit: formatCents(client.limit ?? 0),
                  })}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50"
        >
          {t('chat.logout')}
        </button>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside
          className={`flex w-full flex-col border-r border-slate-200 md:w-80 lg:w-96 ${
            showChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-700">
              {t('dashboard.conversationsTitle')}
            </h2>
          </div>
          <BillingPanel />
          <NewConversationButton />
          <ConversationList />
        </aside>

        <main
          className={`flex min-w-0 flex-1 flex-col ${
            showChat ? 'flex' : 'hidden md:flex'
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
