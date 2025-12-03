import 'reflect-metadata';
import dotenv from 'dotenv';
import path from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../entities/User';
import { Role } from '../entities/Role';
import { Task } from '../entities/Task';
import { TaskAttachment } from '../entities/TaskAttachment';
import { Comment } from '../entities/Comment';
import { InitSchema1700000000000 } from '../migrations/1700000000000-InitSchema';
import { AddCommentTable1700000000001 } from '../migrations/1700000000001-AddCommentTable';
import { AddParentIdToComment1700000000002 } from '../migrations/1700000000002-AddParentIdToComment';
import { AddNotificationTable1700000000003 } from '../migrations/1700000000003-AddNotificationTable';
import { Notification } from '../entities/Notification';

// Load environment variables if not already loaded
// This ensures .env is loaded even if dotenv.config() wasn't called before importing this module
if (!process.env.DB_TYPE && !process.env.DB_HOST) {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}

const entities = [User, Role, Task, TaskAttachment, Comment, Notification];
const migrations = [
  InitSchema1700000000000,
  AddCommentTable1700000000001,
  AddParentIdToComment1700000000002,
  AddNotificationTable1700000000003,
];

const dbType = (process.env.DB_TYPE || 'postgres').toLowerCase();
const synchronize = (process.env.DB_SYNCHRONIZE || 'false').toLowerCase() === 'true';

let dataSourceOptions: DataSourceOptions;

if (dbType === 'sqlite') {
  const databasePath =
    process.env.DB_PATH || path.join(process.cwd(), 'data', 'task_app.sqlite');

  dataSourceOptions = {
    type: 'sqlite',
    database: databasePath,
    synchronize,
    logging: false,
    entities,
    migrations,
  };
} else {
  const port = Number(process.env.DB_PORT || 5432);

  dataSourceOptions = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port,
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'task_app',
    synchronize,
    logging: false,
    entities,
    migrations,
  };
}

export const AppDataSource = new DataSource(dataSourceOptions);