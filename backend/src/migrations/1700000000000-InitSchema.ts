import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';
import { hashPassword } from '../utils/auth';

const uuidColumnType = (driver: QueryRunner['connection']['options']['type']) =>
  driver === 'sqlite' ? 'varchar' : 'uuid';

const timestampColumnType = (driver: QueryRunner['connection']['options']['type']) =>
  driver === 'sqlite' ? 'datetime' : 'timestamp';

const nowDefault = (driver: QueryRunner['connection']['options']['type']) =>
  driver === 'sqlite' ? 'CURRENT_TIMESTAMP' : 'now()';

const uuidDefault = (driver: QueryRunner['connection']['options']['type']) =>
  driver === 'sqlite' ? undefined : 'gen_random_uuid()';

export class InitSchema1700000000000 implements MigrationInterface {
  name = 'InitSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const driverType = queryRunner.connection.options.type;
    const uuidType = uuidColumnType(driverType);
    const timestampType = timestampColumnType(driverType);
    const timestampDefault = nowDefault(driverType);
    const uuidDefaultValue = uuidDefault(driverType);

    await queryRunner.createTable(
      new Table({
        name: 'role',
        columns: [
          {
            name: 'id',
            type: uuidType,
            isPrimary: true,
            default: uuidDefaultValue,
          },
          {
            name: 'name',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'createdAt',
            type: timestampType,
            default: timestampDefault,
          },
          {
            name: 'updatedAt',
            type: timestampType,
            default: timestampDefault,
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'user',
        columns: [
          { name: 'id', type: uuidType, isPrimary: true, default: uuidDefaultValue },
          { name: 'email', type: 'varchar', isUnique: true },
          { name: 'password', type: 'varchar' },
          { name: 'firstName', type: 'varchar' },
          { name: 'lastName', type: 'varchar' },
          { name: 'createdAt', type: timestampType, default: timestampDefault },
          { name: 'updatedAt', type: timestampType, default: timestampDefault },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'task',
        columns: [
          { name: 'id', type: uuidType, isPrimary: true, default: uuidDefaultValue },
          { name: 'title', type: 'varchar' },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'status', type: 'varchar', default: "'todo'" },
          { name: 'ownerId', type: uuidType },
          { name: 'createdAt', type: timestampType, default: timestampDefault },
          { name: 'updatedAt', type: timestampType, default: timestampDefault },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['ownerId'],
            referencedTableName: 'user',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'task_attachment',
        columns: [
          { name: 'id', type: uuidType, isPrimary: true, default: uuidDefaultValue },
          { name: 'filename', type: 'varchar' },
          { name: 'mimetype', type: 'varchar' },
          { name: 'path', type: 'varchar' },
          { name: 'taskId', type: uuidType },
          { name: 'createdAt', type: timestampType, default: timestampDefault },
          { name: 'updatedAt', type: timestampType, default: timestampDefault },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['taskId'],
            referencedTableName: 'task',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'user_roles_role',
        columns: [
          { name: 'userId', type: uuidType, isPrimary: true },
          { name: 'roleId', type: uuidType, isPrimary: true },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['userId'],
            referencedTableName: 'user',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['roleId'],
            referencedTableName: 'role',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'task_assignees_user',
        columns: [
          { name: 'taskId', type: uuidType, isPrimary: true },
          { name: 'userId', type: uuidType, isPrimary: true },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['taskId'],
            referencedTableName: 'task',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['userId'],
            referencedTableName: 'user',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
      }),
    );

    // Seed default roles
    const isSqlite = driverType === 'sqlite';
    
    // Generate password hash for "password" using the same function as the rest of the app
    const passwordHash = await hashPassword('password');
    
    if (isSqlite) {
      // SQLite syntax
      await queryRunner.query(`
        INSERT OR IGNORE INTO role (id, name, "createdAt", "updatedAt") VALUES
        ('7c1c451c-5d56-4c9d-8b3d-f43a5e46b06f', 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('52aef89e-4ba0-4c6c-9c2c-3c9a2432f795', 'manager', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('bdf7d1c7-8431-44e0-8f72-8f0bb7a64552', 'user', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `);
      
      // Create sample users with password "password"
      await queryRunner.query(`
        INSERT OR IGNORE INTO "user" (id, email, password, "firstName", "lastName", "createdAt", "updatedAt") VALUES
        ('5e8f6cf4-3a8d-4a9b-a588-519d2f75b9c6', 'admin@example.com', '${passwordHash}', 'Ada', 'Admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('9c6b7f32-1a2b-4c5d-8e9f-0a1b2c3d4e5f', 'manager@example.com', '${passwordHash}', 'Manny', 'Manager', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('1f2e3d4c-5b6a-7988-9a0b-1c2d3e4f5a6b', 'teammate@example.com', '${passwordHash}', 'Tia', 'Teammate', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `);
      
      // Assign roles to users
      await queryRunner.query(`
        INSERT OR IGNORE INTO user_roles_role ("userId", "roleId") VALUES
        ('5e8f6cf4-3a8d-4a9b-a588-519d2f75b9c6', '7c1c451c-5d56-4c9d-8b3d-f43a5e46b06f'),
        ('9c6b7f32-1a2b-4c5d-8e9f-0a1b2c3d4e5f', '52aef89e-4ba0-4c6c-9c2c-3c9a2432f795'),
        ('1f2e3d4c-5b6a-7988-9a0b-1c2d3e4f5a6b', 'bdf7d1c7-8431-44e0-8f72-8f0bb7a64552')
      `);
      
      // Create sample tasks
      await queryRunner.query(`
        INSERT OR IGNORE INTO task (id, title, description, status, "ownerId", "createdAt", "updatedAt") VALUES
        ('11111111-2222-3333-4444-555555555555', 'Kickoff demo', 'Walk through the project structure with the candidate.', 'in_progress', '5e8f6cf4-3a8d-4a9b-a588-519d2f75b9c6', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('66666666-7777-8888-9999-000000000000', 'Design wireframes', 'Create mobile + desktop mockups for the task board.', 'todo', '9c6b7f32-1a2b-4c5d-8e9f-0a1b2c3d4e5f', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('aaaaaaa1-bbbb-cccc-dddd-eeeeeeeeeeee', 'Implement carousel', 'Build the auto-flip dashboard carousel.', 'done', '1f2e3d4c-5b6a-7988-9a0b-1c2d3e4f5a6b', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `);
      
      // Assign users to tasks
      await queryRunner.query(`
        INSERT OR IGNORE INTO task_assignees_user ("taskId", "userId") VALUES
        ('11111111-2222-3333-4444-555555555555', '5e8f6cf4-3a8d-4a9b-a588-519d2f75b9c6'),
        ('66666666-7777-8888-9999-000000000000', '9c6b7f32-1a2b-4c5d-8e9f-0a1b2c3d4e5f'),
        ('aaaaaaa1-bbbb-cccc-dddd-eeeeeeeeeeee', '1f2e3d4c-5b6a-7988-9a0b-1c2d3e4f5a6b'),
        ('aaaaaaa1-bbbb-cccc-dddd-eeeeeeeeeeee', '5e8f6cf4-3a8d-4a9b-a588-519d2f75b9c6')
      `);
    } else {
      // PostgreSQL syntax - using specific UUIDs from sample data
      await queryRunner.query(`
        INSERT INTO role (id, name, "createdAt", "updatedAt") VALUES
        ('7c1c451c-5d56-4c9d-8b3d-f43a5e46b06f', 'admin', now(), now()),
        ('52aef89e-4ba0-4c6c-9c2c-3c9a2432f795', 'manager', now(), now()),
        ('bdf7d1c7-8431-44e0-8f72-8f0bb7a64552', 'user', now(), now())
        ON CONFLICT (name) DO NOTHING
      `);
      
      // Create sample users with password "password"
      await queryRunner.query(`
        INSERT INTO "user" (id, email, password, "firstName", "lastName", "createdAt", "updatedAt") VALUES
        ('5e8f6cf4-3a8d-4a9b-a588-519d2f75b9c6', 'admin@example.com', '${passwordHash}', 'Ada', 'Admin', now(), now()),
        ('9c6b7f32-1a2b-4c5d-8e9f-0a1b2c3d4e5f', 'manager@example.com', '${passwordHash}', 'Manny', 'Manager', now(), now()),
        ('1f2e3d4c-5b6a-7988-9a0b-1c2d3e4f5a6b', 'teammate@example.com', '${passwordHash}', 'Tia', 'Teammate', now(), now())
        ON CONFLICT (email) DO NOTHING
      `);
      
      // Assign roles to users
      await queryRunner.query(`
        INSERT INTO user_roles_role ("userId", "roleId") VALUES
        ('5e8f6cf4-3a8d-4a9b-a588-519d2f75b9c6', '7c1c451c-5d56-4c9d-8b3d-f43a5e46b06f'),
        ('9c6b7f32-1a2b-4c5d-8e9f-0a1b2c3d4e5f', '52aef89e-4ba0-4c6c-9c2c-3c9a2432f795'),
        ('1f2e3d4c-5b6a-7988-9a0b-1c2d3e4f5a6b', 'bdf7d1c7-8431-44e0-8f72-8f0bb7a64552')
        ON CONFLICT DO NOTHING
      `);
      
      // Create sample tasks
      await queryRunner.query(`
        INSERT INTO task (id, title, description, status, "ownerId", "createdAt", "updatedAt") VALUES
        ('11111111-2222-3333-4444-555555555555', 'Kickoff demo', 'Walk through the project structure with the candidate.', 'in_progress', '5e8f6cf4-3a8d-4a9b-a588-519d2f75b9c6', now(), now()),
        ('66666666-7777-8888-9999-000000000000', 'Design wireframes', 'Create mobile + desktop mockups for the task board.', 'todo', '9c6b7f32-1a2b-4c5d-8e9f-0a1b2c3d4e5f', now(), now()),
        ('aaaaaaa1-bbbb-cccc-dddd-eeeeeeeeeeee', 'Implement carousel', 'Build the auto-flip dashboard carousel.', 'done', '1f2e3d4c-5b6a-7988-9a0b-1c2d3e4f5a6b', now(), now())
        ON CONFLICT (id) DO NOTHING
      `);
      
      // Assign users to tasks
      await queryRunner.query(`
        INSERT INTO task_assignees_user ("taskId", "userId") VALUES
        ('11111111-2222-3333-4444-555555555555', '5e8f6cf4-3a8d-4a9b-a588-519d2f75b9c6'),
        ('66666666-7777-8888-9999-000000000000', '9c6b7f32-1a2b-4c5d-8e9f-0a1b2c3d4e5f'),
        ('aaaaaaa1-bbbb-cccc-dddd-eeeeeeeeeeee', '1f2e3d4c-5b6a-7988-9a0b-1c2d3e4f5a6b'),
        ('aaaaaaa1-bbbb-cccc-dddd-eeeeeeeeeeee', '5e8f6cf4-3a8d-4a9b-a588-519d2f75b9c6')
        ON CONFLICT DO NOTHING
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('task_assignees_user');
    await queryRunner.dropTable('user_roles_role');
    await queryRunner.dropTable('task_attachment');
    await queryRunner.dropTable('task');
    await queryRunner.dropTable('user');
    await queryRunner.dropTable('role');
  }
}

