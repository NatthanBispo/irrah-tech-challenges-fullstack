declare module '@fnando/cpf/commonjs' {
  export function isValid(cpf: string, isStrict?: boolean): boolean;
  export function strip(cpf: string, isStrict?: boolean): string;
  export function format(cpf: string): string;
  export function generate(useFormat?: boolean): string;
  export function verifierDigit(numbers: string): number;
}

declare module '@fnando/cnpj/commonjs' {
  export function isValid(cnpj: string, isStrict?: boolean): boolean;
  export function strip(cnpj: string, isStrict?: boolean): string;
  export function format(cnpj: string): string;
  export function generate(useFormat?: boolean): string;
  export function verifierDigit(numbers: number[]): number;
}
