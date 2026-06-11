import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../../../shared/services/api';
import { login, register } from './auth.service';

vi.mock('../../../shared/services/api', () => ({
  api: {
    post: vi.fn(),
  },
}));

const PASSWORD = 'Senha1234';

describe('auth.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('envia POST /auth com documento, tipo e senha', async () => {
    const response = {
      token: 'client-id',
      client: {
        id: 'client-id',
        name: 'Cliente Teste',
        documentId: '39053344705',
        documentType: 'CPF' as const,
        planType: 'prepaid' as const,
        active: true,
      },
    };

    vi.mocked(api.post).mockResolvedValue({ data: response });

    const result = await login({
      documentId: '39053344705',
      documentType: 'CPF',
      password: PASSWORD,
    });

    expect(api.post).toHaveBeenCalledWith('/auth', {
      documentId: '39053344705',
      documentType: 'CPF',
      password: PASSWORD,
    });
    expect(result).toEqual(response);
  });

  it('envia POST /auth/register com dados de cadastro e senha', async () => {
    const response = {
      token: 'client-id',
      client: {
        id: 'client-id',
        name: 'Empresa Teste',
        documentId: '39053344705',
        documentType: 'CPF' as const,
        planType: 'prepaid' as const,
        balance: 0,
        active: true,
      },
    };

    vi.mocked(api.post).mockResolvedValue({ data: response });

    const result = await register({
      name: 'Empresa Teste',
      documentId: '39053344705',
      documentType: 'CPF',
      planType: 'prepaid',
      password: PASSWORD,
    });

    expect(api.post).toHaveBeenCalledWith('/auth/register', {
      name: 'Empresa Teste',
      documentId: '39053344705',
      documentType: 'CPF',
      planType: 'prepaid',
      password: PASSWORD,
    });
    expect(result).toEqual(response);
  });
});
