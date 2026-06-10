import * as cnpj from '@fnando/cnpj';
import * as cpf from '@fnando/cpf';
import type { DocumentType } from '../types';

export function isValidDocument(
  digits: string,
  documentType: DocumentType,
): boolean {
  if (documentType === 'CPF') {
    return cpf.isValid(digits);
  }

  return cnpj.isValid(digits);
}

export function isValidDocumentAuto(digits: string): boolean {
  if (digits.length === 11) {
    return cpf.isValid(digits);
  }

  if (digits.length === 14) {
    return cnpj.isValid(digits);
  }

  return false;
}
