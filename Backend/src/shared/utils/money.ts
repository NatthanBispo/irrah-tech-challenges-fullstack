/** Valores monetários são armazenados e trafegados em centavos (inteiro). */
export const DEFAULT_POSTPAID_LIMIT_CENTS = 10_000;

export function formatCentsToReais(cents: number): string {
  return (cents / 100).toFixed(2);
}
