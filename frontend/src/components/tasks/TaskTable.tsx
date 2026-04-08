'use client';
import { useState } from 'react';
import { Pencil, Trash2, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskStatusBadge } from './TaskStatusBadge';
import { TaskForm } from './TaskForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useTasks, useDeleteTask } from '@/hooks/useTasks';
import { useToast } from '@/hooks/useToast';
import { formatDate } from '@/lib/utils';
import { Task } from '@/types';

export function TaskTable() {
  const { data: tasks = [], isLoading } = useTasks();
  const deleteTask = useDeleteTask();
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleEdit = (task: Task) => { setEditingTask(task); setFormOpen(true); };
  const handleCreate = () => { setEditingTask(null); setFormOpen(true); };
  const handleDelete = async (id: string) => {
    try {
      await deleteTask.mutateAsync(id);
      toast({ title: 'Task deleted' });
    } catch {
      toast({ title: 'Error', description: 'Failed to delete task', variant: 'destructive' });
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Task Management</h1>
          <p className="text-sm text-muted-foreground">{tasks.length} tasks total</p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Create Task
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Assignee</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {tasks.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">No tasks yet. Create your first task.</td></tr>
            ) : tasks.map((task) => (
              <tr key={task.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    {task.description && <p className="text-xs text-muted-foreground truncate max-w-xs">{task.description}</p>}
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {task.assignedTo ? (
                    <div>
                      <p className="text-foreground text-xs font-medium">{task.assignedTo.name}</p>
                      <p className="text-xs">{task.assignedTo.email}</p>
                    </div>
                  ) : <span className="text-xs italic">Unassigned</span>}
                </td>
                <td className="px-4 py-3"><TaskStatusBadge status={task.status} /></td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(task.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(task)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete task?</AlertDialogTitle>
                          <AlertDialogDescription>This action cannot be undone. The audit log will still record this deletion.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDelete(task.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TaskForm open={formOpen} onClose={() => { setFormOpen(false); setEditingTask(null); }} task={editingTask} />
    </div>
  );
}
