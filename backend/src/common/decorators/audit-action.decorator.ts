import { SetMetadata } from '@nestjs/common';
import { AuditAction } from '@prisma/client';

export const AUDIT_ACTION_KEY = 'auditAction';
export const AuditActionDecorator = (action: AuditAction) =>
  SetMetadata(AUDIT_ACTION_KEY, action);
