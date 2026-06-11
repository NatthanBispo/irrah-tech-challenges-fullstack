import { describe, expect, it } from 'vitest';
import { formatCents, reaisToCents } from './money';

describe('money', () => {
  it('formata centavos para reais', () => {
    expect(formatCents(5000)).toBe('50.00');
    expect(formatCents(25)).toBe('0.25');
  });

  it('converte reais para centavos', () => {
    expect(reaisToCents(25)).toBe(2500);
    expect(reaisToCents(0.25)).toBe(25);
  });
});
