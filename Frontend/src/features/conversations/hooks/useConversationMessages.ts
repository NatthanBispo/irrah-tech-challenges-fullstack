import { useQuery } from '@tanstack/react-query';
import { getConversationMessages } from '../services/conversations.service';

export function useConversationMessages(conversationId: string | undefined) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => getConversationMessages(conversationId!),
    enabled: Boolean(conversationId),
    refetchInterval: 3000,
  });
}
