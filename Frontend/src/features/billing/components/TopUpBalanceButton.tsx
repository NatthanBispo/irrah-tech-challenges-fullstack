import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { reaisToCents } from '../../../shared/utils/money';
import { useTopUpBalance } from '../hooks/useTopUpBalance';

const PRESET_AMOUNTS = [10, 25, 50];

export function TopUpBalanceButton() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { mutate, isPending } = useTopUpBalance();

  function handleTopUp(reais: number) {
    if (reais <= 0) {
      setError(t('billing.invalidAmount'));
      return;
    }

    setError(null);
    mutate(reaisToCents(reais), {
      onSuccess: () => {
        setOpen(false);
        setCustomAmount('');
      },
      onError: () => {
        setError(t('billing.topUpError'));
      },
    });
  }

  return (
    <div className="border-b border-slate-200 px-4 py-2">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="w-full rounded-lg border border-emerald-600 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
      >
        {t('billing.addBalance')}
      </button>

      {open && (
        <div className="mt-2 space-y-2 rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-xs text-slate-500">{t('billing.selectAmount')}</p>
          <div className="flex flex-wrap gap-2">
            {PRESET_AMOUNTS.map((amount) => (
              <button
                key={amount}
                type="button"
                disabled={isPending}
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
              onChange={(event) => {
                setCustomAmount(event.target.value);
                setError(null);
              }}
              placeholder={t('billing.customAmountPlaceholder')}
              disabled={isPending}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:opacity-60"
            />
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleTopUp(Number(customAmount))}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {isPending ? t('billing.topUpSubmitting') : t('billing.topUpSubmit')}
            </button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
}
