import { cn, STATUS_CONFIG } from '@/lib/utils';
import { TaskStatus } from '@/types';

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', cfg.className)}>
      {cfg.label}
    </span>
  );
}
