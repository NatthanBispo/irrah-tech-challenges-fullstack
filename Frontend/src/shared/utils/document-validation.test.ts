import { describe, expect, it } from 'vitest';
import { isValidDocument, isValidDocumentAuto } from './document-validation';

describe('document-validation', () => {
  it('valida CPF válido', () => {
    expect(isValidDocument('39053344705', 'CPF')).toBe(true);
    expect(isValidDocumentAuto('39053344705')).toBe(true);
  });

  it('rejeita CPF inválido', () => {
    expect(isValidDocument('12345678901', 'CPF')).toBe(false);
    expect(isValidDocumentAuto('12345678901')).toBe(false);
  });

  it('valida CNPJ válido', () => {
    expect(isValidDocument('11222333000181', 'CNPJ')).toBe(true);
    expect(isValidDocumentAuto('11222333000181')).toBe(true);
  });

  it('rejeita CNPJ inválido', () => {
    expect(isValidDocument('12345678000199', 'CNPJ')).toBe(false);
    expect(isValidDocumentAuto('12345678000199')).toBe(false);
  });

  it('rejeita quantidade inválida de dígitos no modo automático', () => {
    expect(isValidDocumentAuto('123456')).toBe(false);
  });
});
