import { useQuery } from '@tanstack/react-query';
import { getConversations } from '../services/conversations.service';

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: getConversations,
    refetchInterval: 3000,
  });
}
