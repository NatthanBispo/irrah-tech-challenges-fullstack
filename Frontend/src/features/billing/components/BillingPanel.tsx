import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatCents, reaisToCents } from '../../../shared/utils/money';
import { useAuth } from '../../auth/context/AuthContext';
import { useConvertPlan } from '../hooks/useConvertPlan';
import { useTopUpBalance } from '../hooks/useTopUpBalance';
import { useTransactions } from '../hooks/useTransactions';
import { useUpdateLimit } from '../hooks/useUpdateLimit';

const PRESET_AMOUNTS = [10, 25, 50];

export function BillingPanel() {
  const { t } = useTranslation();
  const { client } = useAuth();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'actions' | 'history'>('actions');
  const [customAmount, setCustomAmount] = useState('');
  const [newLimitReais, setNewLimitReais] = useState('');
  const [confirmConvert, setConfirmConvert] = useState<'prepaid' | 'postpaid' | null>(null);
  const [topUpError, setTopUpError] = useState<string | null>(null);
  const [limitError, setLimitError] = useState<string | null>(null);

  const { mutate: topUp, isPending: toppingUp } = useTopUpBalance();
  const { mutate: updateLimit, isPending: updatingLimit } = useUpdateLimit();
  const { mutate: convertPlan, isPending: converting } = useConvertPlan();
  const { data: transactions, isLoading: loadingTx } = useTransactions();

  const isPrepaid = client?.planType === 'prepaid';

  function handleTopUp(reais: number) {
    if (reais <= 0) {
      setTopUpError(t('billing.invalidAmount'));
      return;
    }
    setTopUpError(null);
    topUp(reaisToCents(reais), {
      onSuccess: () => {
        setCustomAmount('');
      },
      onError: () => setTopUpError(t('billing.topUpError')),
    });
  }

  function handleLimitUpdate() {
    const reais = Number(newLimitReais);
    if (reais <= 0) {
      setLimitError(t('billing.invalidAmount'));
      return;
    }
    setLimitError(null);
    updateLimit(reaisToCents(reais), {
      onSuccess: () => setNewLimitReais(''),
    });
  }

  function handleConvert(planType: 'prepaid' | 'postpaid') {
    convertPlan(planType, {
      onSuccess: () => setConfirmConvert(null),
    });
  }

  const txTypeLabel: Record<string, string> = {
    debit: t('billing.transactionTypes.debit'),
    credit: t('billing.transactionTypes.credit'),
    postpaid_charge: t('billing.transactionTypes.postpaid_charge'),
    plan_conversion_credit: t('billing.transactionTypes.plan_conversion_credit'),
    postpaid_settlement: t('billing.transactionTypes.postpaid_settlement'),
  };

  const buttonLabel = isPrepaid ? t('billing.addBalance') : t('billing.adjustLimit');

  return (
    <div className="border-b border-slate-200 px-4 py-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full rounded-lg border border-emerald-600 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
      >
        {buttonLabel}
      </button>

      {open && (
        <div className="mt-2 space-y-3 rounded-lg border border-slate-200 bg-white p-3 text-sm">
          <div className="flex gap-2 border-b border-slate-100 pb-2">
            <button
              type="button"
              onClick={() => setTab('actions')}
              className={`flex-1 rounded py-1 text-xs font-medium transition ${
                tab === 'actions'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Ações
            </button>
            <button
              type="button"
              onClick={() => setTab('history')}
              className={`flex-1 rounded py-1 text-xs font-medium transition ${
                tab === 'history'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t('billing.transactionHistory')}
            </button>
          </div>

          {tab === 'actions' && (
            <div className="space-y-3">
              {isPrepaid && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500">{t('billing.selectAmount')}</p>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_AMOUNTS.map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        disabled={toppingUp}
                        onClick={() => handleTopUp(amount)}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
                      >
                        R$ {amount.toFixed(2)}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setTopUpError(null);
                      }}
                      placeholder={t('billing.customAmountPlaceholder')}
                      disabled={toppingUp}
                      className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:opacity-60"
                    />
                    <button
                      type="button"
                      disabled={toppingUp}
                      onClick={() => handleTopUp(Number(customAmount))}
                      className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {toppingUp ? t('billing.topUpSubmitting') : t('billing.topUpSubmit')}
                    </button>
                  </div>
                  {topUpError && <p className="text-xs text-red-600">{topUpError}</p>}
                </div>
              )}

              {!isPrepaid && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500">{t('billing.newLimit')} (R$)</p>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={newLimitReais}
                      onChange={(e) => {
                        setNewLimitReais(e.target.value);
                        setLimitError(null);
                      }}
                      placeholder="Ex: 200.00"
                      disabled={updatingLimit}
                      className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:opacity-60"
                    />
                    <button
                      type="button"
                      disabled={updatingLimit}
                      onClick={handleLimitUpdate}
                      className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {updatingLimit
                        ? t('billing.adjustLimitSubmitting')
                        : t('billing.adjustLimitSubmit')}
                    </button>
                  </div>
                  {limitError && <p className="text-xs text-red-600">{limitError}</p>}
                </div>
              )}

              <hr className="border-slate-100" />

              {isPrepaid ? (
                <button
                  type="button"
                  disabled={converting}
                  onClick={() => setConfirmConvert('postpaid')}
                  className="w-full rounded-lg border border-blue-600 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:opacity-60"
                >
                  {t('billing.convertToPostpaid')}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={converting}
                  onClick={() => setConfirmConvert('prepaid')}
                  className="w-full rounded-lg border border-blue-600 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:opacity-60"
                >
                  {t('billing.convertToPrepaid')}
                </button>
              )}

              {confirmConvert && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-2">
                  <p className="text-xs font-medium text-amber-800">
                    {t('billing.convertConfirmTitle')}
                  </p>
                  <p className="text-xs text-amber-700">
                    {confirmConvert === 'postpaid'
                      ? t('billing.convertConfirmPostpaid')
                      : t('billing.convertConfirmPrepaid')}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={converting}
                      onClick={() => handleConvert(confirmConvert)}
                      className="flex-1 rounded bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
                    >
                      {converting
                        ? 'Aguarde...'
                        : t('billing.convertConfirm')}
                    </button>
                    <button
                      type="button"
                      disabled={converting}
                      onClick={() => setConfirmConvert(null)}
                      className="flex-1 rounded border border-slate-300 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                    >
                      {t('billing.convertCancel')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'history' && (
            <div className="max-h-56 overflow-y-auto space-y-1.5">
              {loadingTx && (
                <p className="text-xs text-slate-400">Carregando...</p>
              )}
              {!loadingTx && (!transactions || transactions.length === 0) && (
                <p className="text-xs text-slate-400">
                  {t('billing.noTransactions')}
                </p>
              )}
              {transactions?.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded border border-slate-100 px-2 py-1.5"
                >
                  <div>
                    <p className="text-xs font-medium text-slate-700">
                      {txTypeLabel[tx.type] ?? tx.type}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(tx.createdAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      tx.type === 'debit' || tx.type === 'postpaid_charge'
                        ? 'text-red-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {tx.type === 'debit' || tx.type === 'postpaid_charge' ? '-' : '+'}
                    {formatCents(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
