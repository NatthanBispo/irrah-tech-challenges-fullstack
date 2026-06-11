import { MessagePriority } from '@prisma/client';
import {
  getEstimatedDelivery,
  getMessageCost,
  MESSAGE_COSTS_CENTS,
} from './message-costs';

describe('message-costs', () => {
  it('define custo fixo por prioridade em centavos', () => {
    expect(MESSAGE_COSTS_CENTS[MessagePriority.normal]).toBe(25);
    expect(MESSAGE_COSTS_CENTS[MessagePriority.urgent]).toBe(50);
    expect(getMessageCost(MessagePriority.normal)).toBe(25);
    expect(getMessageCost(MessagePriority.urgent)).toBe(50);
  });

  it('calcula estimatedDelivery no futuro', () => {
    const before = Date.now();
    const delivery = getEstimatedDelivery(MessagePriority.normal);
    const after = Date.now();

    expect(delivery.getTime()).toBeGreaterThanOrEqual(before + 29_000);
    expect(delivery.getTime()).toBeLessThanOrEqual(after + 31_000);
  });
});
