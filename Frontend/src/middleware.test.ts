import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CLIENT_KEY, TOKEN_KEY } from './shared/constants';

describe('middleware', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
  });

  it('limpa sessão e chama handler registrado em resposta 401', async () => {
    const handler = vi.fn();
    const { setupMiddleware, registerUnauthorizedHandler } =
      await import('./middleware');
    const { api } = await import('./shared/services/api');

    setupMiddleware();
    registerUnauthorizedHandler(handler);
    localStorage.setItem(TOKEN_KEY, 'token-demo');
    localStorage.setItem(CLIENT_KEY, JSON.stringify({ id: 'client-1' }));

    api.defaults.adapter = () =>
      Promise.reject(
        Object.assign(new Error('Unauthorized'), {
          response: { status: 401 },
          isAxiosError: true,
        }),
      );

    await expect(api.get('/conversations')).rejects.toBeDefined();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(CLIENT_KEY)).toBeNull();
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
