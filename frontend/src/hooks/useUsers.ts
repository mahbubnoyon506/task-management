import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { User } from '@/types';

export function useUsers() {
  return useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => api.get('/users').then((r) => r.data),
  });
}
