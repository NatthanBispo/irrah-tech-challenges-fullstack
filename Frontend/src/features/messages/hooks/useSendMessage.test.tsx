import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as authContext from '../../auth/context/AuthContext';
import * as conversationsService from '../../conversations/services/conversations.service';
import * as messagesService from '../services/messages.service';
import { useSendMessage } from './useSendMessage';

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

vi.mock('../services/messages.service');
vi.mock('../../conversations/services/conversations.service');

const prepaidClient = {
  id: 'client-1',
  name: 'Cliente',
  documentId: '39053344705',
  documentType: 'CPF' as const,
  planType: 'prepaid' as const,
  balance: 1000,
  active: true,
};

const postpaidClient = {
  id: 'client-2',
  name: 'Tech Solutions',
  documentId: '11222333000181',
  documentType: 'CNPJ' as const,
  planType: 'postpaid' as const,
  limit: 10000,
  active: true,
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
}

describe('useSendMessage', () => {
  const updateClient = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authContext.useAuth).mockReturnValue({
      client: prepaidClient,
      token: 'token',
      isAuthenticated: true,
      saveSession: vi.fn(),
      updateClient,
      logout: vi.fn(),
    });
  });

  it('exibe toast de sucesso após envio', async () => {
    const { toast } = await import('sonner');

    vi.mocked(messagesService.sendMessage).mockResolvedValue({
      id: 'msg-1',
      status: 'queued',
      timestamp: '2026-06-11T12:00:00.000Z',
      estimatedDelivery: '2026-06-11T12:00:30.000Z',
      cost: 25,
      currentBalance: 975,
    });

    const { result } = renderHook(
      () => useSendMessage({ conversationId: 'conv-1' }),
      { wrapper: createWrapper() },
    );

    result.current.mutate({ content: 'Olá', priority: 'normal' });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Mensagem enviada!');
    });
  });

  it('atualiza saldo do cliente pré-pago após envio bem-sucedido', async () => {
    vi.mocked(messagesService.sendMessage).mockResolvedValue({
      id: 'msg-1',
      status: 'queued',
      timestamp: '2026-06-11T12:00:00.000Z',
      estimatedDelivery: '2026-06-11T12:00:30.000Z',
      cost: 25,
      currentBalance: 975,
    });

    const { result } = renderHook(
      () => useSendMessage({ conversationId: 'conv-1' }),
      { wrapper: createWrapper() },
    );

    result.current.mutate({ content: 'Olá', priority: 'normal' });

    await waitFor(() => {
      expect(updateClient).toHaveBeenCalledWith({
        ...prepaidClient,
        balance: 975,
      });
    });
  });

  it('não atualiza saldo para cliente pós-pago sem currentBalance', async () => {
    vi.mocked(authContext.useAuth).mockReturnValue({
      client: postpaidClient,
      token: 'token',
      isAuthenticated: true,
      saveSession: vi.fn(),
      updateClient,
      logout: vi.fn(),
    });

    vi.mocked(messagesService.sendMessage).mockResolvedValue({
      id: 'msg-2',
      status: 'queued',
      timestamp: '2026-06-11T12:00:00.000Z',
      estimatedDelivery: '2026-06-11T12:00:30.000Z',
      cost: 25,
    });

    const { result } = renderHook(
      () => useSendMessage({ conversationId: 'conv-1' }),
      { wrapper: createWrapper() },
    );

    result.current.mutate({ content: 'Olá', priority: 'normal' });

    await waitFor(() => {
      expect(messagesService.sendMessage).toHaveBeenCalled();
    });

    expect(updateClient).not.toHaveBeenCalled();
  });

  it('navega para conversa criada ao enviar para novo destinatário', async () => {
    vi.mocked(messagesService.sendMessage).mockResolvedValue({
      id: 'msg-3',
      status: 'queued',
      timestamp: '2026-06-11T12:00:00.000Z',
      estimatedDelivery: '2026-06-11T12:00:30.000Z',
      cost: 25,
      currentBalance: 975,
    });
    vi.mocked(conversationsService.getConversations).mockResolvedValue([
      {
        id: 'conv-new',
        recipientId: 'rec-1',
        recipientName: 'Maria Silva',
        lastMessageContent: 'Olá',
        lastMessageTime: '2026-06-11T12:00:00.000Z',
        unreadCount: 0,
      },
    ]);

    const { result } = renderHook(
      () => useSendMessage({ recipientId: 'rec-1' }),
      { wrapper: createWrapper() },
    );

    result.current.mutate({ content: 'Olá', priority: 'normal' });

    await waitFor(() => {
      expect(conversationsService.getConversations).toHaveBeenCalled();
    });
  });
});
