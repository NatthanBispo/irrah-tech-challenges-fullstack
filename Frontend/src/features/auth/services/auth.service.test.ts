import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../../../shared/services/api';
import { login } from './auth.service';

vi.mock('../../../shared/services/api', () => ({
  api: {
    post: vi.fn(),
  },
}));

describe('auth.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('envia POST /auth com documento e tipo', async () => {
    const response = {
      token: 'client-id',
      client: {
        id: 'client-id',
        name: 'Cliente Teste',
        documentId: '12345678901',
        documentType: 'CPF' as const,
        planType: 'prepaid' as const,
        active: true,
      },
    };

    vi.mocked(api.post).mockResolvedValue({ data: response });

    const result = await login({
      documentId: '12345678901',
      documentType: 'CPF',
    });

    expect(api.post).toHaveBeenCalledWith('/auth', {
      documentId: '12345678901',
      documentType: 'CPF',
    });
    expect(result).toEqual(response);
  });
});
