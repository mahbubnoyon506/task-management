import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@taskapp.com' },
    update: {},
    create: {
      email: 'admin@taskapp.com',
      passwordHash: adminPassword,
      name: 'Admin User',
      role: Role.ADMIN,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@taskapp.com' },
    update: {},
    create: {
      email: 'user@taskapp.com',
      passwordHash: userPassword,
      name: 'John Doe',
      role: Role.USER,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'jane@taskapp.com' },
    update: {},
    create: {
      email: 'jane@taskapp.com',
      passwordHash: userPassword,
      name: 'Jane Smith',
      role: Role.USER,
    },
  });

  // Seed sample tasks
  await prisma.task.upsert({
    where: { id: 'task-seed-1' },
    update: {},
    create: {
      id: 'task-seed-1',
      title: 'Fix Bug #123',
      description: 'Resolve the login timeout issue reported by users.',
      status: 'PROCESSING',
      assignedToId: user.id,
      createdById: admin.id,
    },
  });

  await prisma.task.upsert({
    where: { id: 'task-seed-2' },
    update: {},
    create: {
      id: 'task-seed-2',
      title: 'Write Documentation',
      description: 'Document the new API endpoints for the v2 release.',
      status: 'PENDING',
      assignedToId: user2.id,
      createdById: admin.id,
    },
  });

  await prisma.task.upsert({
    where: { id: 'task-seed-3' },
    update: {},
    create: {
      id: 'task-seed-3',
      title: 'Design New UI',
      description: 'Create mockups for the redesigned dashboard.',
      status: 'DONE',
      assignedToId: user.id,
      createdById: admin.id,
    },
  });

  console.log('Seed complete!');
  console.log('Admin:', admin.email, '/ Password: admin123');
  console.log('User1:', user.email, '/ Password: user123');
  console.log('User2:', user2.email, '/ Password: user123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
