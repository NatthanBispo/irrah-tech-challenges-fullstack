import { PrismaService } from '../../../shared/database/prisma.service';
import { MonthlyResetService } from './monthly-reset.service';

describe('MonthlyResetService', () => {
  let service: MonthlyResetService;

  const prisma = {
    client: {
      updateMany: jest.fn(),
    },
  };

  beforeEach(() => {
    service = new MonthlyResetService(prisma as unknown as PrismaService);
    jest.clearAllMocks();
  });

  it('zera monthlyUsage de todos os clientes pós-pago', async () => {
    prisma.client.updateMany.mockResolvedValue({ count: 5 });

    await service.resetMonthlyUsage();

    expect(prisma.client.updateMany).toHaveBeenCalledWith({
      where: { planType: 'postpaid' },
      data: { monthlyUsage: 0 },
    });
  });

  it('não lança erro quando não há clientes pós-pago', async () => {
    prisma.client.updateMany.mockResolvedValue({ count: 0 });

    await expect(service.resetMonthlyUsage()).resolves.not.toThrow();
  });
});
