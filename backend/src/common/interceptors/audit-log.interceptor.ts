import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditAction } from '@prisma/client';
import { AUDIT_ACTION_KEY } from '../decorators/audit-action.decorator';
import { AuditService } from '../../audit/audit.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
    private readonly prisma: PrismaService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const action = this.reflector.get<AuditAction>(
      AUDIT_ACTION_KEY,
      context.getHandler(),
    );

    // Skip if no audit action is decorated
    if (!action) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const actor = request.user;
    const taskId = request.params?.id;

    // Capture the BEFORE snapshot for updates/deletes
    let beforeSnapshot: any = null;
    if (taskId && action !== AuditAction.TASK_CREATED) {
      beforeSnapshot = await this.prisma.task.findUnique({
        where: { id: taskId },
        include: { assignedTo: { select: { id: true, name: true, email: true } } },
      });
    }

    return next.handle().pipe(
      tap(async (responseBody) => {
        try {
          const resolvedTaskId = taskId ?? responseBody?.id;
          const afterSnapshot =
            action === AuditAction.TASK_DELETED ? null : responseBody;

          await this.auditService.log({
            actorId: actor.id,
            actionType: action,
            targetTaskId: resolvedTaskId || null,
            beforeSnapshot,
            afterSnapshot,
          });
        } catch (err) {
          // Never let audit failures break the main response
          console.error('Audit log failed:', err);
        }
      }),
    );
  }
}
