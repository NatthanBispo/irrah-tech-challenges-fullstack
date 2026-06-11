import { MessagePriority } from '@prisma/client';

/** Custos em centavos: normal R$ 0,25 = 25 | urgente R$ 0,50 = 50 */
export const MESSAGE_COSTS_CENTS: Record<MessagePriority, number> = {
  [MessagePriority.normal]: 25,
  [MessagePriority.urgent]: 50,
};

export const ESTIMATED_DELIVERY_SECONDS: Record<MessagePriority, number> = {
  [MessagePriority.normal]: 30,
  [MessagePriority.urgent]: 10,
};

export function getMessageCost(priority: MessagePriority): number {
  return MESSAGE_COSTS_CENTS[priority];
}

export function getEstimatedDelivery(priority: MessagePriority): Date {
  const seconds = ESTIMATED_DELIVERY_SECONDS[priority];
  return new Date(Date.now() + seconds * 1000);
}
