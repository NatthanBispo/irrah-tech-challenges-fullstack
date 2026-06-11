import { ClientEntity } from '../entities/client.entity';

export function mapClient(client: ClientEntity) {
  return {
    id: client.id,
    name: client.name,
    documentId: client.documentId,
    documentType: client.documentType,
    balance: client.planType === 'prepaid' ? client.balance : undefined,
    limit: client.planType === 'postpaid' ? client.limit : undefined,
    monthlyUsage: client.planType === 'postpaid' ? client.monthlyUsage : undefined,
    planType: client.planType,
    active: client.active,
  };
}

export function buildAuthResponse(client: ClientEntity) {
  return {
    token: client.id,
    client: mapClient(client),
  };
}
