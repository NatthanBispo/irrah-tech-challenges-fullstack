/** Valores monetários da API são expressos em centavos (inteiro). */

export function formatCents(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function reaisToCents(reais: number): number {
  return Math.round(reais * 100);
}
