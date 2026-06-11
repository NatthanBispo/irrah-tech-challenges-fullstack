import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  detectDocumentType,
  formatDocumentAuto,
  stripDocument,
} from '../../../shared/utils/document-mask';
import { isValidDocumentAuto } from '../../../shared/utils/document-validation';
import { useLogin } from '../hooks/useLogin';

export function LoginForm() {
  const { t } = useTranslation();
  const [documentId, setDocumentId] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { mutate, isPending, isError } = useLogin();

  const digits = stripDocument(documentId);
  const isCnpj = digits.length > 11;

  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        const stripped = stripDocument(documentId);
        const documentType = detectDocumentType(stripped);

        if (!documentType) {
          setValidationError(t('auth.invalidDocumentLength'));
          return;
        }

        if (!isValidDocumentAuto(stripped)) {
          setValidationError(
            documentType === 'CNPJ'
              ? t('auth.invalidCnpj')
              : t('auth.invalidCpf'),
          );
          return;
        }

        if (!password.trim()) {
          setValidationError(t('auth.passwordRequired'));
          return;
        }

        setValidationError(null);
        mutate({ documentId: stripped, documentType, password });
      }}
    >
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          {t('auth.documentLabel')}
        </label>
        <input
          type="text"
          inputMode="numeric"
          value={documentId}
          onChange={(e) => {
            setDocumentId(formatDocumentAuto(e.target.value));
            setValidationError(null);
          }}
          placeholder={
            isCnpj
              ? t('auth.documentPlaceholderCnpj')
              : t('auth.documentPlaceholderCpf')
          }
          maxLength={18}
          required
          disabled={isPending}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          {t('auth.passwordLabel')}
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setValidationError(null);
          }}
          placeholder={t('auth.passwordPlaceholder')}
          autoComplete="current-password"
          required
          disabled={isPending}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
        />
      </div>

      {validationError && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {validationError}
        </p>
      )}

      {isError && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {t('auth.loginError')}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
      >
        {isPending ? t('auth.submitting') : t('auth.submit')}
      </button>

      <p className="text-center text-sm text-slate-500">
        {t('auth.noAccount')}{' '}
        <Link
          to="/register"
          className="font-medium text-blue-600 hover:underline"
        >
          {t('auth.registerLink')}
        </Link>
      </p>
    </form>
  );
}
