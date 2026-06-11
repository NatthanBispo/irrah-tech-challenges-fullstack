import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../../features/auth/context/AuthContext';
import { API_URL } from '../constants';

interface StatusUpdatedPayload {
  messageId: string;
  conversationId: string;
  status: string;
}

interface NewReplyPayload {
  conversationId: string;
}

export function useMessageSocket() {
  const { client } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!client) return;

    const socket = io(`${API_URL}/messages`, {
      auth: { token: client.id },
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on('message:status_updated', ({ conversationId }: StatusUpdatedPayload) => {
      void queryClient.invalidateQueries({
        queryKey: ['messages', conversationId],
      });
    });

    socket.on('message:new_reply', ({ conversationId }: NewReplyPayload) => {
      void queryClient.invalidateQueries({
        queryKey: ['messages', conversationId],
      });
      void queryClient.invalidateQueries({
        queryKey: ['conversations'],
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [client?.id, queryClient]);
}
