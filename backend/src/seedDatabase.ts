import 'reflect-metadata';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';
import { AppDataSource } from './config/data-source';
import { User } from './entities/User';
import { Role } from './entities/Role';
import { Task } from './entities/Task';
import { hashPassword } from './utils/auth';

dotenv.config();

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

    // Create or get roles (generate UUIDs dynamically)
    let adminRole = await roleRepository.findOne({ where: { name: 'admin' } });
    if (!adminRole) {
      adminRole = roleRepository.create({
        id: randomUUID(),
        name: 'admin',
      });
      await roleRepository.save(adminRole);
    }

    let managerRole = await roleRepository.findOne({ where: { name: 'manager' } });
    if (!managerRole) {
      managerRole = roleRepository.create({
        id: randomUUID(),
        name: 'manager',
      });
      await roleRepository.save(managerRole);
    }

    let userRole = await roleRepository.findOne({ where: { name: 'user' } });
    if (!userRole) {
      userRole = roleRepository.create({
        id: randomUUID(),
        name: 'user',
      });
      await roleRepository.save(userRole);
    }

    console.log('✓ Created/verified 3 roles');

    // Create users with dynamically generated UUIDs and password hash
    // Password for all users: "password"
    const passwordHash = await hashPassword('password');

    const adminUser = userRepository.create({
      id: randomUUID(),
      email: 'admin@example.com',
      password: passwordHash,
      firstName: 'Ada',
      lastName: 'Admin',
      roles: [adminRole],
    });

    const managerUser = userRepository.create({
      id: randomUUID(),
      email: 'manager@example.com',
      password: passwordHash,
      firstName: 'Manny',
      lastName: 'Manager',
      roles: [managerRole],
    });

    const regularUser = userRepository.create({
      id: randomUUID(),
      email: 'teammate@example.com',
      password: passwordHash,
      firstName: 'Tia',
      lastName: 'Teammate',
      roles: [userRole],
    });

    await userRepository.save([adminUser, managerUser, regularUser]);
    console.log('✓ Created 3 users');

    // Create tasks with dynamically generated UUIDs
    const task1 = taskRepository.create({
      id: randomUUID(),
      title: 'Kickoff demo',
      description: 'Walk through the project structure with the candidate.',
      status: 'in_progress',
      owner: adminUser,
      assignees: [adminUser],
    });

    const task2 = taskRepository.create({
      id: randomUUID(),
      title: 'Design wireframes',
      description: 'Create mobile + desktop mockups for the task board.',
      status: 'todo',
      owner: managerUser,
      assignees: [managerUser],
    });

    const task3 = taskRepository.create({
      id: randomUUID(),
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

