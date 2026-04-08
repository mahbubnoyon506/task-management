'use client';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuditDiffViewer } from './AuditDiffViewer';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { formatDate, ACTION_CONFIG } from '@/lib/utils';
import { AuditLog } from '@/types';
import { cn } from '@/lib/utils';

export function AuditLogTable() {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AuditLog | null>(null);
  const { data, isLoading } = useAuditLogs(page, 15);

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Audit Log</h1>
        <p className="text-sm text-muted-foreground">{data?.total ?? 0} total events recorded</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-md border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Timestamp</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actor</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Action</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Task</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(data?.data ?? []).length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">No audit events yet.</td></tr>
              ) : (data?.data ?? []).map((log) => {
                const cfg = ACTION_CONFIG[log.actionType];
                return (
                  <tr
                    key={log.id}
                    className={cn('hover:bg-muted/30 cursor-pointer transition-colors', selected?.id === log.id && 'bg-muted/50')}
                    onClick={() => setSelected(selected?.id === log.id ? null : log)}
                  >
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDate(log.createdAt)}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-xs">{log.actor.name}</p>
                      <p className="text-xs text-muted-foreground">{log.actor.role}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', cfg.className)}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {log.targetTask?.title ?? (log.beforeSnapshot as any)?.title ?? '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <p className="text-xs text-muted-foreground">Page {data.page} of {data.totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage(p => p + 1)} disabled={page === data.totalPages}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="xl:col-span-1">
          <AuditDiffViewer log={selected} />
        </div>
      </div>
    </div>
  );
}
