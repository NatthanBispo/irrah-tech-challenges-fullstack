import type { DocumentType } from '../types';

const CPF_LENGTH = 11;
const CNPJ_LENGTH = 14;

export function stripDocument(value: string): string {
  return value.replace(/\D/g, '');
}

export function detectDocumentType(digits: string): DocumentType | null {
  if (digits.length === CPF_LENGTH) return 'CPF';
  if (digits.length === CNPJ_LENGTH) return 'CNPJ';
  return null;
}

export function formatDocumentAuto(value: string): string {
  const digits = stripDocument(value);
  const type: DocumentType = digits.length > CPF_LENGTH ? 'CNPJ' : 'CPF';
  return formatDocument(digits, type);
}

export function formatDocument(value: string, type: DocumentType): string {
  const digits = stripDocument(value);

  if (type === 'CPF') {
    return digits
      .slice(0, CPF_LENGTH)
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }

  return digits
    .slice(0, CNPJ_LENGTH)
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}
