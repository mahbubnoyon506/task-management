'use client';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdateTaskStatus } from '@/hooks/useTasks';
import { useToast } from '@/hooks/useToast';
import { TaskStatus } from '@/types';
import { STATUS_CONFIG } from '@/lib/utils';

interface Props { taskId: string; currentStatus: TaskStatus; }

export function StatusDropdown({ taskId, currentStatus }: Props) {
  const [value, setValue] = useState(currentStatus);
  const { mutateAsync, isPending } = useUpdateTaskStatus();
  const { toast } = useToast();

  const handleChange = async (newStatus: string) => {
    try {
      await mutateAsync({ id: taskId, status: newStatus });
      setValue(newStatus as TaskStatus);
      toast({ title: 'Status updated', description: `Task moved to ${STATUS_CONFIG[newStatus as TaskStatus].label}` });
    } catch {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  return (
    <Select value={value} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className="w-36 h-8 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((s) => (
          <SelectItem key={s} value={s} className="text-xs">{STATUS_CONFIG[s].label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
