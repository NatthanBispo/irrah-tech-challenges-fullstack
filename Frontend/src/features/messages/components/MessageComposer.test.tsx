import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../test/test-utils';
import { MessageComposer } from './MessageComposer';
import * as useSendMessageHook from '../hooks/useSendMessage';
import * as authContext from '../../auth/context/AuthContext';

vi.mock('../hooks/useSendMessage');
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));
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

  it('botão de enviar fica desabilitado quando conteúdo está vazio', () => {
    renderWithProviders(<MessageComposer conversationId="conv-1" />);

    expect(screen.getByRole('button', { name: 'Enviar' })).toBeDisabled();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('botão de enviar fica habilitado ao digitar conteúdo', async () => {
    const user = userEvent.setup();

    renderWithProviders(<MessageComposer conversationId="conv-1" />);

    expect(screen.getByRole('button', { name: 'Enviar' })).toBeDisabled();

    await user.type(
      screen.getByPlaceholderText('Digite sua mensagem...'),
      'Olá!',
    );

    expect(screen.getByRole('button', { name: 'Enviar' })).toBeEnabled();
  });

  it('exibe toast de conteúdo obrigatório ao submeter formulário vazio via Enter', async () => {
    const { toast } = await import('sonner');
    const user = userEvent.setup();

    renderWithProviders(<MessageComposer conversationId="conv-1" />);

    const textarea = screen.getByPlaceholderText('Digite sua mensagem...');
    await user.click(textarea);
    await user.keyboard('{Enter}');

    expect(toast.error).toHaveBeenCalledWith('Digite uma mensagem antes de enviar.');
    expect(mutate).not.toHaveBeenCalled();
  });
});
