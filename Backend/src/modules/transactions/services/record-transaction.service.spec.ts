import { TransactionType } from '@prisma/client';
import { TransactionsRepository } from '../repositories/transactions.repository';
import { RecordTransactionService } from './record-transaction.service';

describe('RecordTransactionService', () => {
  let service: RecordTransactionService;

  const transactionsRepository = {
    create: jest.fn(),
    createWithTx: jest.fn(),
  };

  beforeEach(() => {
    service = new RecordTransactionService(
      transactionsRepository as unknown as TransactionsRepository,
    );
    jest.clearAllMocks();
  });

  it('chama create com os dados corretos', async () => {
    transactionsRepository.create.mockResolvedValue({ id: 'tx-1' });

    await service.execute({
      clientId: 'client-1',
      type: TransactionType.credit,
      amount: 1000,
      description: 'Recarga de saldo',
      balanceAfter: 2000,
    });

    expect(transactionsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        clientId: 'client-1',
        type: TransactionType.credit,
        amount: 1000,
      }),
    );
  });

  it('chama createWithTx quando fornece tx', async () => {
    transactionsRepository.createWithTx.mockResolvedValue({ id: 'tx-2' });
    const fakeTx = {} as never;

    await service.executeWithTx(fakeTx, {
      clientId: 'client-1',
      type: TransactionType.debit,
      amount: 25,
      description: 'Débito',
    });

    expect(transactionsRepository.createWithTx).toHaveBeenCalledWith(
      fakeTx,
      expect.objectContaining({
        clientId: 'client-1',
        type: TransactionType.debit,
      }),
    );
  });

  describe('buildDescription', () => {
    it.each([
      [TransactionType.debit, 'Débito por envio de mensagem'],
      [TransactionType.credit, 'Recarga de saldo'],
      [TransactionType.postpaid_charge, 'Cobrança pós-pago por mensagem'],
      [
        TransactionType.plan_conversion_credit,
        'Crédito por conversão de plano pré-pago para pós-pago',
      ],
      [
        TransactionType.postpaid_settlement,
        'Apuração de consumo pós-pago por conversão para pré-pago',
      ],
    ])(
      'retorna descrição correta para %s',
      (type, expectedSubstring) => {
        const desc = service.buildDescription(type);
        expect(desc).toContain(expectedSubstring);
      },
    );
  });
});
