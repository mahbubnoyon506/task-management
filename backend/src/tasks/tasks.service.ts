import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { Role } from '@prisma/client';

const TASK_INCLUDE = {
  assignedTo: { select: { id: true, name: true, email: true } },
  createdBy: { select: { id: true, name: true, email: true } },
};

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(user: any) {
    const where = user.role === Role.ADMIN ? {} : { assignedToId: user.id };
    return this.prisma.task.findMany({
      where,
      include: TASK_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, user: any) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: TASK_INCLUDE,
    });
    if (!task) throw new NotFoundException('Task not found');
    if (user.role !== Role.ADMIN && task.assignedToId !== user.id) {
      throw new ForbiddenException('Access denied');
    }
    return task;
  }

  async create(dto: CreateTaskDto, user: any) {
    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status || 'PENDING',
        assignedToId: dto.assignedToId || null,
        createdById: user.id,
      },
      include: TASK_INCLUDE,
    });
  }

  async update(id: string, dto: UpdateTaskDto) {
    await this.ensureExists(id);
    return this.prisma.task.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        assignedToId: dto.assignedToId,
        status: dto.status,
      },
      include: TASK_INCLUDE,
    });
  }

  async updateStatus(id: string, dto: UpdateStatusDto, user: any) {
    const task = await this.ensureExists(id);
    if (user.role !== Role.ADMIN && task.assignedToId !== user.id) {
      throw new ForbiddenException('You can only update your own tasks');
    }
    return this.prisma.task.update({
      where: { id },
      data: { status: dto.status },
      include: TASK_INCLUDE,
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.task.delete({ where: { id }, include: TASK_INCLUDE });
  }

  private async ensureExists(id: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }
}
