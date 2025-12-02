import 'reflect-metadata';
import dotenv from 'dotenv';
import { AppDataSource } from './config/data-source';
import { User } from './entities/User';
import { Role } from './entities/Role';
import { Task } from './entities/Task';
import { hashPassword } from './utils/auth';

dotenv.config();

// UUIDs from sqlite-sample.sql for consistency
const ROLE_IDS = {
  admin: '7c1c451c-5d56-4c9d-8b3d-f43a5e46b06f',
  manager: '52aef89e-4ba0-4c6c-9c2c-3c9a2432f795',
  user: 'bdf7d1c7-8431-44e0-8f72-8f0bb7a64552',
};

const USER_IDS = {
  admin: '5e8f6cf4-3a8d-4a9b-a588-519d2f75b9c6',
  manager: '9c6b7f32-1a2b-4c5d-8e9f-0a1b2c3d4e5f',
  regular: '1f2e3d4c-5b6a-7988-9a0b-1c2d3e4f5a6b',
};

const TASK_IDS = {
  task1: '11111111-2222-3333-4444-555555555555',
  task2: '66666666-7777-8888-9999-000000000000',
  task3: 'aaaaaaa1-bbbb-cccc-dddd-eeeeeeeeeeee',
};

const seed = async () => {
  try {
    await AppDataSource.initialize();
    const userRepository = AppDataSource.getRepository(User);
    const roleRepository = AppDataSource.getRepository(Role);
    const taskRepository = AppDataSource.getRepository(Task);

    // Check if data already exists
    const existingUsers = await userRepository.count();
    if (existingUsers > 0) {
      console.log('Database already has data. Skipping seed.');
      await AppDataSource.destroy();
      process.exit(0);
    }

    // Get roles (they should already exist from migration)
    // Try to find by ID first (from sample data), then by name
    let adminRole = await roleRepository.findOne({ where: { id: ROLE_IDS.admin } });
    let managerRole = await roleRepository.findOne({ where: { id: ROLE_IDS.manager } });
    let userRole = await roleRepository.findOne({ where: { id: ROLE_IDS.user } });

    if (!adminRole) {
      adminRole = await roleRepository.findOne({ where: { name: 'admin' } });
    }
    if (!managerRole) {
      managerRole = await roleRepository.findOne({ where: { name: 'manager' } });
    }
    if (!userRole) {
      userRole = await roleRepository.findOne({ where: { name: 'user' } });
    }

    if (!adminRole || !managerRole || !userRole) {
      throw new Error('Roles not found. Please run migrations first.');
    }

    // Create users
    // Password for all users: "password"
    const passwordHash = await hashPassword('password');

    const adminUser = userRepository.create({
      id: USER_IDS.admin,
      email: 'admin@example.com',
      password: passwordHash,
      firstName: 'Ada',
      lastName: 'Admin',
      roles: [adminRole],
    });

    const managerUser = userRepository.create({
      id: USER_IDS.manager,
      email: 'manager@example.com',
      password: passwordHash,
      firstName: 'Manny',
      lastName: 'Manager',
      roles: [managerRole],
    });

    const regularUser = userRepository.create({
      id: USER_IDS.regular,
      email: 'teammate@example.com',
      password: passwordHash,
      firstName: 'Tia',
      lastName: 'Teammate',
      roles: [userRole],
    });

    await userRepository.save([adminUser, managerUser, regularUser]);
    console.log('✓ Created 3 users');

    // Create tasks
    const task1 = taskRepository.create({
      id: TASK_IDS.task1,
      title: 'Kickoff demo',
      description: 'Walk through the project structure with the candidate.',
      status: 'in_progress',
      owner: adminUser,
      assignees: [adminUser],
    });

    const task2 = taskRepository.create({
      id: TASK_IDS.task2,
      title: 'Design wireframes',
      description: 'Create mobile + desktop mockups for the task board.',
      status: 'todo',
      owner: managerUser,
      assignees: [managerUser],
    });

    const task3 = taskRepository.create({
      id: TASK_IDS.task3,
      title: 'Implement carousel',
      description: 'Build the auto-flip dashboard carousel.',
      status: 'done',
      owner: regularUser,
      assignees: [regularUser, adminUser],
    });

    await taskRepository.save([task1, task2, task3]);
    console.log('✓ Created 3 tasks');

    console.log('\n✅ Database seeded successfully!');
    console.log('\nSample users (password: "password"):');
    console.log('  - admin@example.com (admin)');
    console.log('  - manager@example.com (manager)');
    console.log('  - teammate@example.com (user)');

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    await AppDataSource.destroy();
    process.exit(1);
  }
};

seed();

