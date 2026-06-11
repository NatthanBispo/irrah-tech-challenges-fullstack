import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../test/test-utils';
import { ConversationList } from './ConversationList';
import * as useConversationsHook from '../hooks/useConversations';

vi.mock('../hooks/useConversations');

describe('ConversationList', () => {
  it('exibe loading', () => {
    vi.mocked(useConversationsHook.useConversations).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as never);

    renderWithProviders(<ConversationList />);

    expect(screen.getByText('Carregando conversas...')).toBeInTheDocument();
  });

  it('exibe lista de conversas', () => {
    vi.mocked(useConversationsHook.useConversations).mockReturnValue({
      data: [
        {
          id: 'conv-1',
          recipientId: 'rec-1',
          recipientName: 'Maria Silva',
          lastMessageContent: 'Olá!',
          lastMessageTime: '2026-06-11T12:00:00.000Z',
          unreadCount: 2,
        },
      ],
      isLoading: false,
      isError: false,
    } as never);

    renderWithProviders(<ConversationList />);

    expect(screen.getByText('Maria Silva')).toBeInTheDocument();
    expect(screen.getByText('Olá!')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('exibe estado vazio', () => {
    vi.mocked(useConversationsHook.useConversations).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as never);

    renderWithProviders(<ConversationList />);

    expect(screen.getByText('Nenhuma conversa encontrada.')).toBeInTheDocument();
  });
});
