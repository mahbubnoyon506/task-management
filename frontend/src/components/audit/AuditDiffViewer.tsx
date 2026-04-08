'use client';
import { AuditLog } from '@/types';
import { ACTION_CONFIG, STATUS_CONFIG, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Props { log: AuditLog | null; }

function DiffRow({ label, before, after }: { label: string; before?: any; after?: any }) {
  const changed = JSON.stringify(before) !== JSON.stringify(after);
  if (!changed && before === undefined && after === undefined) return null;
  return (
    <div className={cn('rounded-md px-3 py-2 text-xs', changed ? 'bg-amber-50 dark:bg-amber-900/10' : 'bg-muted/40')}>
      <p className="font-medium text-muted-foreground mb-1 uppercase tracking-wide text-[10px]">{label}</p>
      {changed ? (
        <div className="space-y-1">
          {before !== undefined && <p className="line-through text-red-600 dark:text-red-400 break-all">{String(before ?? '—')}</p>}
          {after !== undefined && <p className="text-green-700 dark:text-green-400 break-all">{String(after ?? '—')}</p>}
        </div>
      ) : (
        <p className="break-all">{String(after ?? before ?? '—')}</p>
      )}
    </div>
  );
}

function renderStatus(s?: string) {
  if (!s) return s;
  return STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.label ?? s;
}

export function AuditDiffViewer({ log }: Props) {
  if (!log) return (
    <div className="rounded-md border bg-card h-full flex items-center justify-center p-8 text-center">
      <p className="text-sm text-muted-foreground">Select a log entry to see details</p>
    </div>
  );

  const before = log.beforeSnapshot as Record<string, any> | null;
  const after = log.afterSnapshot as Record<string, any> | null;
  const cfg = ACTION_CONFIG[log.actionType];

  return (
    <div className="rounded-md border bg-card h-full">
      <div className="border-b px-4 py-3">
        <div className="flex items-center gap-2 mb-1">
          <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', cfg.className)}>{cfg.label}</span>
        </div>
        <p className="text-xs text-muted-foreground">{formatDate(log.createdAt)}</p>
        <p className="text-xs text-muted-foreground">by <span className="font-medium text-foreground">{log.actor.name}</span></p>
      </div>

      <div className="p-4 space-y-2 overflow-auto max-h-[500px]">
        {log.actionType === 'TASK_DELETED' && before && (
          <>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Deleted task snapshot</p>
            <DiffRow label="Title" after={before.title} />
            <DiffRow label="Status" after={renderStatus(before.status)} />
            <DiffRow label="Description" after={before.description} />
          </>
        )}

        {log.actionType === 'TASK_CREATED' && after && (
          <>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Created with</p>
            <DiffRow label="Title" after={after.title} />
            <DiffRow label="Status" after={renderStatus(after.status)} />
            {after.description && <DiffRow label="Description" after={after.description} />}
          </>
        )}

        {(log.actionType === 'TASK_UPDATED' || log.actionType === 'TASK_STATUS_CHANGED' || log.actionType === 'TASK_ASSIGNED') && before && after && (
          <>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Changes</p>
            {before.title !== after.title && <DiffRow label="Title" before={before.title} after={after.title} />}
            {before.status !== after.status && <DiffRow label="Status" before={renderStatus(before.status)} after={renderStatus(after.status)} />}
            {before.description !== after.description && <DiffRow label="Description" before={before.description} after={after.description} />}
            {before.assignedToId !== after.assignedToId && (
              <DiffRow label="Assigned to" before={before.assignedTo?.name ?? before.assignedToId ?? 'Unassigned'} after={after.assignedTo?.name ?? after.assignedToId ?? 'Unassigned'} />
            )}
            {before.title === after.title && before.status === after.status && before.description === after.description && before.assignedToId === after.assignedToId && (
              <p className="text-xs text-muted-foreground text-center py-4">No field-level changes detected.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
