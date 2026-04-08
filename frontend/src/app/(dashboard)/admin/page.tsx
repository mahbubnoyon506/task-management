'use client';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useUsers } from '@/hooks/useUsers';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { TaskTable } from '@/components/tasks/TaskTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList, Users, ScrollText, CheckCircle2 } from 'lucide-react';

export default function AdminPage() {
  const { isAdmin } = useAuthStore();
  const router = useRouter();
  const { data: tasks = [] } = useTasks();
  const { data: users = [] } = useUsers();
  const { data: logs } = useAuditLogs(1, 1);

  useEffect(() => {
    if (!isAdmin()) router.replace('/dashboard');
  }, [isAdmin, router]);

  const doneTasks = tasks.filter(t => t.status === 'DONE').length;
  const pendingTasks = tasks.filter(t => t.status === 'PENDING').length;

  const stats = [
    { label: 'Total Tasks', value: tasks.length, icon: ClipboardList, color: 'text-blue-500' },
    { label: 'Completed', value: doneTasks, icon: CheckCircle2, color: 'text-green-500' },
    { label: 'Pending', value: pendingTasks, icon: ClipboardList, color: 'text-amber-500' },
    { label: 'Team Members', value: users.length, icon: Users, color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
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
      <TaskTable />
    </div>
  );
}
