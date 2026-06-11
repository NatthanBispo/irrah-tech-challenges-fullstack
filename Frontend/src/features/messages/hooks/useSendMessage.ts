import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { SendMessageRequest } from '../../../shared/types';
import { getConversations } from '../../conversations/services/conversations.service';
import { useAuth } from '../../auth/context/AuthContext';
import { sendMessage } from '../services/messages.service';

interface UseSendMessageOptions {
  conversationId?: string;
  recipientId?: string;
}

export function useSendMessage(options: UseSendMessageOptions) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { client, updateClient } = useAuth();

  return useMutation({
    mutationFn: (payload: Pick<SendMessageRequest, 'content' | 'priority' | 'type'>) => {
      if (options.conversationId) {
        return sendMessage({ ...payload, conversationId: options.conversationId });
      }

      if (options.recipientId) {
        return sendMessage({ ...payload, recipientId: options.recipientId });
      }

      throw new Error('conversationId ou recipientId é obrigatório');
    },
    onSuccess: async (data) => {
      toast.success('Mensagem enviada!');
      if (client) {
        if (data.currentBalance !== undefined) {
          updateClient({ ...client, balance: data.currentBalance });
        } else if (client.planType === 'postpaid') {
          updateClient({
            ...client,
            monthlyUsage: (client.monthlyUsage ?? 0) + data.cost,
          });
        }
      }

      await queryClient.invalidateQueries({ queryKey: ['conversations'] });

      if (options.conversationId) {
        void queryClient.invalidateQueries({
          queryKey: ['messages', options.conversationId],
        });
        return;
      }

      if (options.recipientId) {
        const conversations = await queryClient.fetchQuery({
          queryKey: ['conversations'],
          queryFn: getConversations,
        });
        const conversation = conversations.find(
          (item) => item.recipientId === options.recipientId,
        );

        if (conversation) {
          navigate(`/dashboard/${conversation.id}`, { replace: true });
        }
      }
    },
  });
}
