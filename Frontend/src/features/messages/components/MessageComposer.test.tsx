import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../test/test-utils';
import { MessageComposer } from './MessageComposer';
import * as useSendMessageHook from '../hooks/useSendMessage';
import * as authContext from '../../auth/context/AuthContext';

vi.mock('../hooks/useSendMessage');
vi.mock('../../auth/context/AuthContext', async (importOriginal) => {
  const actual = await importOriginal<typeof authContext>();
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

describe('MessageComposer', () => {
  const mutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authContext.useAuth).mockReturnValue({
      client: {
        id: 'client-1',
        name: 'Cliente',
        documentId: '39053344705',
        documentType: 'CPF',
        planType: 'prepaid',
        balance: 1000,
        active: true,
      },
      token: 'token',
      isAuthenticated: true,
      saveSession: vi.fn(),
      updateClient: vi.fn(),
      logout: vi.fn(),
    });
    vi.mocked(useSendMessageHook.useSendMessage).mockReturnValue({
      mutate,
      isPending: false,
    } as never);
  });

  it('envia mensagem ao submeter formulário com tipo padrão whatsapp', async () => {
    const user = userEvent.setup();

    renderWithProviders(<MessageComposer conversationId="conv-1" />);

    await user.type(
      screen.getByPlaceholderText('Digite sua mensagem...'),
      'Olá!',
    );
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith(
        { content: 'Olá!', priority: 'normal', type: 'whatsapp' },
        expect.any(Object),
      );
    });
  });

  it('envia mensagem com tipo sms quando selecionado', async () => {
    const user = userEvent.setup();

    renderWithProviders(<MessageComposer conversationId="conv-1" />);

    const smsRadio = screen.getByRole('radio', { name: 'SMS' });
    await user.click(smsRadio);

    await user.type(
      screen.getByPlaceholderText('Digite sua mensagem...'),
      'SMS!',
    );
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith(
        { content: 'SMS!', priority: 'normal', type: 'sms' },
        expect.any(Object),
      );
    });
  });

  it('exibe erro quando conteúdo está vazio', async () => {
    const user = userEvent.setup();

    renderWithProviders(<MessageComposer conversationId="conv-1" />);

    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(
      await screen.findByText('Digite uma mensagem antes de enviar.'),
    ).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('exibe erro de limite excedido para cliente pós-pago com 402', async () => {
    vi.mocked(authContext.useAuth).mockReturnValue({
      client: {
        id: 'client-2',
        name: 'Tech Solutions',
        documentId: '11222333000181',
        documentType: 'CNPJ',
        planType: 'postpaid',
        limit: 10000,
        active: true,
      },
      token: 'token',
      isAuthenticated: true,
      saveSession: vi.fn(),
      updateClient: vi.fn(),
      logout: vi.fn(),
    });

    mutate.mockImplementation((_payload, options) => {
      options?.onError?.({ response: { status: 402 } });
    });

    const user = userEvent.setup();

    renderWithProviders(<MessageComposer conversationId="conv-1" />);

    await user.type(
      screen.getByPlaceholderText('Digite sua mensagem...'),
      'Mensagem cara',
    );
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(
      await screen.findByText('Limite mensal excedido para enviar esta mensagem.'),
    ).toBeInTheDocument();
  });

  it('exibe erro de saldo insuficiente para cliente pré-pago com 402', async () => {
    mutate.mockImplementation((_payload, options) => {
      options?.onError?.({ response: { status: 402 } });
    });

    const user = userEvent.setup();

    renderWithProviders(<MessageComposer conversationId="conv-1" />);

    await user.type(
      screen.getByPlaceholderText('Digite sua mensagem...'),
      'Sem saldo',
    );
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(
      await screen.findByText('Saldo insuficiente para enviar esta mensagem.'),
    ).toBeInTheDocument();
  });
});
