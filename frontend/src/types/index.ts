export type Role = 'ADMIN' | 'USER';
export type TaskStatus = 'PENDING' | 'PROCESSING' | 'DONE';
export type AuditAction =
  | 'TASK_CREATED'
  | 'TASK_UPDATED'
  | 'TASK_DELETED'
  | 'TASK_STATUS_CHANGED'
  | 'TASK_ASSIGNED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assignedToId?: string;
  assignedTo?: Pick<User, 'id' | 'name' | 'email'> | null;
  createdBy?: Pick<User, 'id' | 'name' | 'email'>;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actor: Pick<User, 'id' | 'name' | 'email' | 'role'>;
  actionType: AuditAction;
  targetTaskId?: string | null;
  targetTask?: { id: string; title: string } | null;
  beforeSnapshot?: Record<string, any> | null;
  afterSnapshot?: Record<string, any> | null;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
