import { describe, expect, it } from 'vitest';
import {
  detectDocumentType,
  formatDocument,
  formatDocumentAuto,
  stripDocument,
} from './document-mask';

describe('document-mask', () => {
  it('formata CPF enquanto digita', () => {
    expect(formatDocument('12345678901', 'CPF')).toBe('123.456.789-01');
  });

  it('formata CNPJ enquanto digita', () => {
    expect(formatDocument('12345678000199', 'CNPJ')).toBe('12.345.678/0001-99');
  });

  it('limita CPF a 11 dígitos', () => {
    expect(formatDocument('123456789012345', 'CPF')).toBe('123.456.789-01');
  });

  it('limita CNPJ a 14 dígitos', () => {
    expect(formatDocument('123456780001991234', 'CNPJ')).toBe('12.345.678/0001-99');
  });

  it('remove caracteres não numéricos', () => {
    expect(stripDocument('123.456.789-01')).toBe('12345678901');
    expect(stripDocument('12.345.678/0001-99')).toBe('12345678000199');
  });

  it('detecta tipo pelo número de dígitos', () => {
    expect(detectDocumentType('12345678901')).toBe('CPF');
    expect(detectDocumentType('12345678000199')).toBe('CNPJ');
    expect(detectDocumentType('123456')).toBeNull();
  });

  it('formata automaticamente conforme quantidade de dígitos', () => {
    expect(formatDocumentAuto('12345678901')).toBe('123.456.789-01');
    expect(formatDocumentAuto('12345678000199')).toBe('12.345.678/0001-99');
  });
});
