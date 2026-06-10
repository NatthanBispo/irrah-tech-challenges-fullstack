import { useState } from 'react';
import type { DocumentType } from '../../../shared/types';
import { useLogin } from '../hooks/useLogin';

export function LoginForm() {
  const [documentId, setDocumentId] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('CPF');
  const { mutate, isPending, isError } = useLogin();

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        mutate({ documentId, documentType });
      }}
    >
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          CPF / CNPJ
        </label>
        <input
          type="text"
          value={documentId}
          onChange={(e) => setDocumentId(e.target.value)}
          placeholder="Digite seu documento"
          required
          disabled={isPending}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Tipo</p>
        <div className="flex gap-6">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="documentType"
              checked={documentType === 'CPF'}
              onChange={() => setDocumentType('CPF')}
              disabled={isPending}
            />
            PF (CPF)
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="documentType"
              checked={documentType === 'CNPJ'}
              onChange={() => setDocumentType('CNPJ')}
              disabled={isPending}
            />
            PJ (CNPJ)
          </label>
        </div>
      </div>

      {isError && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          Documento não encontrado ou cliente inativo.
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
      >
        {isPending ? 'Entrando...' : 'Entrar'}
      </button>

      <p className="text-center text-xs text-slate-400">
        Testes: CPF <span className="font-mono">12345678901</span> · CNPJ{' '}
        <span className="font-mono">12345678000199</span>
      </p>
    </form>
  );
}
