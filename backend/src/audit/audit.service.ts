import { Injectable } from '@nestjs/common';
import { AuditAction } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

interface LogParams {
  actorId: string;
  actionType: AuditAction;
  targetTaskId?: string | null;
  beforeSnapshot?: any;
  afterSnapshot?: any;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(params: LogParams) {
    return this.prisma.auditLog.create({
      data: {
        actorId: params.actorId,
        actionType: params.actionType,
        targetTaskId: params.targetTaskId || null,
        beforeSnapshot: params.beforeSnapshot ?? undefined,
        afterSnapshot: params.afterSnapshot ?? undefined,
      },
    });
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: { select: { id: true, name: true, email: true, role: true } },
          targetTask: { select: { id: true, title: true } },
        },
      }),
      this.prisma.auditLog.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
