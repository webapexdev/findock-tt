import 'reflect-metadata';
import dotenv from 'dotenv';
import path from 'path';
import { Client } from 'pg';

// Load environment variables from .env file in the backend directory
// Use process.cwd() to ensure we're looking in the backend root directory
const envPath = path.resolve(process.cwd(), '.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
  // eslint-disable-next-line no-console
  console.warn(`Warning: Could not load .env file from ${envPath}:`, result.error.message);
  // eslint-disable-next-line no-console
  console.log('Current working directory:', process.cwd());
} else {
  // eslint-disable-next-line no-console
  console.log(`Loaded .env file from: ${envPath}`);
}

import { AppDataSource } from './config/data-source';

const run = async () => {
  try {
    // For PostgreSQL, check if database exists and create it if needed
    const dbType = (process.env.DB_TYPE || 'postgres').toLowerCase();
    if (dbType === 'postgres') {
      const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 5432),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'root',
        database: 'postgres', // Connect to default postgres database
      });

      await client.connect();
      const dbName = process.env.DB_NAME || 'task_app';
      
      // Check if database exists
      const result = await client.query(
        'SELECT 1 FROM pg_database WHERE datname = $1',
        [dbName]
      );

      if (result.rows.length === 0) {
        // eslint-disable-next-line no-console
        console.log(`Database "${dbName}" does not exist. Creating it...`);
        await client.query(`CREATE DATABASE "${dbName}"`);
        // eslint-disable-next-line no-console
        console.log(`Database "${dbName}" created successfully.`);
      }
      
      await client.end();
    }

    const dataSource = await AppDataSource.initialize();
    await dataSource.runMigrations();
    await dataSource.destroy();
    // eslint-disable-next-line no-console
    console.log('Migrations ran successfully');
    process.exit(0);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Migration failed', error);
    process.exit(1);
  }
};

run();

