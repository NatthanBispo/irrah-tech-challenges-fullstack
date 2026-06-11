import { useQuery } from '@tanstack/react-query';
import { getRecipients } from '../services/recipients.service';

export function useRecipients() {
  return useQuery({
    queryKey: ['recipients'],
    queryFn: getRecipients,
  });
}
