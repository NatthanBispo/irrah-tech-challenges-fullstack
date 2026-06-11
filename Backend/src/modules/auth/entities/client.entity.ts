export type DocumentTypeValue = 'CPF' | 'CNPJ';
export type PlanTypeValue = 'prepaid' | 'postpaid';

export interface ClientEntity {
  id: string;
  name: string;
  documentId: string;
  documentType: DocumentTypeValue;
  planType: PlanTypeValue;
  balance: { toString(): string } | number;
  limit: { toString(): string } | number;
  monthlyUsage: { toString(): string } | number;
  active: boolean;
}
