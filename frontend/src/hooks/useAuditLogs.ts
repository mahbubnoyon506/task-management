import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { PaginatedResponse, AuditLog } from '@/types';

export function useAuditLogs(page = 1, limit = 20) {
  return useQuery<PaginatedResponse<AuditLog>>({
    queryKey: ['audit-logs', page, limit],
    queryFn: () =>
      api.get('/audit-logs', { params: { page, limit } }).then((r) => r.data),
  });
}
