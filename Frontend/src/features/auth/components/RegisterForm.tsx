import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { PlanType } from '../../../shared/types';
import {
  detectDocumentType,
  formatDocumentAuto,
  stripDocument,
} from '../../../shared/utils/document-mask';
import { isValidDocument } from '../../../shared/utils/document-validation';
import { useRegister } from '../hooks/useRegister';

export function RegisterForm() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [planType, setPlanType] = useState<PlanType>('prepaid');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { mutate, isPending, isError, error } = useRegister();

  const stripped = stripDocument(documentId);
  const detectedType = detectDocumentType(stripped);

  const isConflict =
    isError &&
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    (error as { response?: { status?: number } }).response?.status === 409;

  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();

        if (!detectedType) {
          setValidationError(t('auth.invalidDocumentLength'));
          return;
        }

        if (!isValidDocument(stripped, detectedType)) {
          setValidationError(
            detectedType === 'CNPJ'
              ? t('auth.invalidCnpj')
              : t('auth.invalidCpf'),
          );
          return;
        }

        setValidationError(null);
        mutate({
          name,
          documentId: stripped,
          documentType: detectedType,
          planType,
        });
      }}
    >
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          {t('register.nameLabel')}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('register.namePlaceholder')}
          required
          disabled={isPending}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          {t('auth.documentLabel')}
          {detectedType && (
            <span className="ml-2 text-xs font-normal text-slate-400">
              {detectedType === 'CPF' ? t('auth.cpf') : t('auth.cnpj')}
            </span>
          )}
        </label>
        <input
          type="text"
          inputMode="numeric"
          value={documentId}
          onChange={(e) => {
            setDocumentId(formatDocumentAuto(e.target.value));
            setValidationError(null);
          }}
          placeholder={t('auth.documentPlaceholderCpf')}
          maxLength={18}
          required
          disabled={isPending}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">
          {t('register.planLabel')}
        </p>
        <div className="space-y-3">
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3 transition hover:border-blue-300">
            <input
              type="radio"
              name="planType"
              checked={planType === 'prepaid'}
              onChange={() => setPlanType('prepaid')}
              disabled={isPending}
              className="mt-1"
            />
            <span>
              <span className="block text-sm font-medium text-slate-800">
                {t('register.prepaid')}
              </span>
              <span className="block text-xs text-slate-500">
                {t('register.prepaidDescription')}
              </span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3 transition hover:border-blue-300">
            <input
              type="radio"
              name="planType"
              checked={planType === 'postpaid'}
              onChange={() => setPlanType('postpaid')}
              disabled={isPending}
              className="mt-1"
            />
            <span>
              <span className="block text-sm font-medium text-slate-800">
                {t('register.postpaid')}
              </span>
              <span className="block text-xs text-slate-500">
                {t('register.postpaidDescription')}
              </span>
            </span>
          </label>
        </div>
      </div>

      {validationError && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {validationError}
        </p>
      )}

      {isError && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {isConflict ? t('register.conflictError') : t('register.genericError')}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
      >
        {isPending ? t('register.submitting') : t('register.submit')}
      </button>

      <p className="text-center text-sm text-slate-500">
        {t('register.hasAccount')}{' '}
        <Link to="/login" className="font-medium text-blue-600 hover:underline">
          {t('register.loginLink')}
        </Link>
      </p>
    </form>
  );
}
