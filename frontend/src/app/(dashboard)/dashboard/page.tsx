'use client';
import { useTasks } from '@/hooks/useTasks';
import { useAuthStore } from '@/store/authStore';
import { StatusDropdown } from '@/components/tasks/StatusDropdown';
import { TaskStatusBadge } from '@/components/tasks/TaskStatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { Loader2, ClipboardList, CheckCircle2, Clock } from 'lucide-react';

export default function UserDashboardPage() {
  const { user } = useAuthStore();
  const { data: tasks = [], isLoading } = useTasks();

  const done = tasks.filter(t => t.status === 'DONE').length;
  const processing = tasks.filter(t => t.status === 'PROCESSING').length;
  const pending = tasks.filter(t => t.status === 'PENDING').length;

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My Tasks</h1>
        <p className="text-sm text-muted-foreground">Welcome back, {user?.name}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending', value: pending, icon: Clock, color: 'text-amber-500' },
          { label: 'In Progress', value: processing, icon: ClipboardList, color: 'text-blue-500' },
          { label: 'Done', value: done, icon: CheckCircle2, color: 'text-green-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className={`h-4 w-4 ${color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-md border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Task</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Last Updated</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Update Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                  No tasks assigned to you yet.
                </td>
              </tr>
            ) : tasks.map((task) => (
              <tr key={task.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium">{task.title}</p>
                  {task.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 max-w-sm truncate">{task.description}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <TaskStatusBadge status={task.status} />
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {formatDate(task.updatedAt)}
                </td>
                <td className="px-4 py-3">
                  <StatusDropdown taskId={task.id} currentStatus={task.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
