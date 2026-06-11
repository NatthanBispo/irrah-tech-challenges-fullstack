import { TransactionType } from '@prisma/client';
import { TransactionsRepository } from '../repositories/transactions.repository';
import { ListTransactionsService } from './list-transactions.service';

describe('ListTransactionsService', () => {
  let service: ListTransactionsService;

  const transactionsRepository = {
    findByClientId: jest.fn(),
  };

  beforeEach(() => {
    service = new ListTransactionsService(
      transactionsRepository as unknown as TransactionsRepository,
    );
    jest.clearAllMocks();
  });

  it('retorna transações mapeadas para o cliente', async () => {
    const now = new Date();
    transactionsRepository.findByClientId.mockResolvedValue([
      {
        id: 'tx-1',
        type: TransactionType.credit,
        amount: 1000,
        description: 'Recarga',
        balanceAfter: 2000,
        messageId: null,
        createdAt: now,
      },
    ]);

    const result = await service.execute('client-1');

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'tx-1',
      type: TransactionType.credit,
      amount: 1000,
      createdAt: now.toISOString(),
    });
  });

  it('repassa filtros para o repositório', async () => {
    transactionsRepository.findByClientId.mockResolvedValue([]);

    await service.execute('client-1', {
      type: TransactionType.debit,
      from: '2026-06-01',
      to: '2026-06-30',
    });

    expect(transactionsRepository.findByClientId).toHaveBeenCalledWith(
      'client-1',
      expect.objectContaining({
        type: TransactionType.debit,
        from: new Date('2026-06-01'),
        to: new Date('2026-06-30'),
      }),
    );
  });
});
