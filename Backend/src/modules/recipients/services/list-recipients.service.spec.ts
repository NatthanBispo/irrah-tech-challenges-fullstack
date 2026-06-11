import { RecipientsRepository } from '../repositories/recipients.repository';
import { ListRecipientsService } from './list-recipients.service';

describe('ListRecipientsService', () => {
  let service: ListRecipientsService;

  const recipientsRepository = {
    findAll: jest.fn(),
  };

  beforeEach(() => {
    service = new ListRecipientsService(
      recipientsRepository as unknown as RecipientsRepository,
    );
    jest.clearAllMocks();
  });

  it('lista destinatários com id e nome', async () => {
    recipientsRepository.findAll.mockResolvedValue([
      { id: 'rec-1', name: 'Ana Costa' },
      { id: 'rec-2', name: 'Maria Silva' },
    ]);

    const result = await service.execute();

    expect(recipientsRepository.findAll).toHaveBeenCalled();
    expect(result).toEqual([
      { id: 'rec-1', name: 'Ana Costa' },
      { id: 'rec-2', name: 'Maria Silva' },
    ]);
  });
});
