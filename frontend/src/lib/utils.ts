import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TaskStatus, AuditAction } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(dateStr));
}

export const STATUS_CONFIG: Record<TaskStatus, { label: string; className: string }> = {
  PENDING:    { label: 'Pending',    className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
  PROCESSING: { label: 'Processing', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  DONE:       { label: 'Done',       className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
};

export const ACTION_CONFIG: Record<AuditAction, { label: string; className: string }> = {
  TASK_CREATED:       { label: 'Created',        className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  TASK_UPDATED:       { label: 'Updated',        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  TASK_DELETED:       { label: 'Deleted',        className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  TASK_STATUS_CHANGED:{ label: 'Status Changed', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
  TASK_ASSIGNED:      { label: 'Assigned',       className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
};
