import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

const uuidColumnType = (driver: QueryRunner['connection']['options']['type']) =>
  driver === 'sqlite' ? 'varchar' : 'uuid';

const timestampColumnType = (driver: QueryRunner['connection']['options']['type']) =>
  driver === 'sqlite' ? 'datetime' : 'timestamp';

const nowDefault = (driver: QueryRunner['connection']['options']['type']) =>
  driver === 'sqlite' ? 'CURRENT_TIMESTAMP' : 'now()';

const uuidDefault = (driver: QueryRunner['connection']['options']['type']) =>
  driver === 'sqlite' ? undefined : 'gen_random_uuid()';

export class AddNotificationTable1700000000003 implements MigrationInterface {
  name = 'AddNotificationTable1700000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const driverType = queryRunner.connection.options.type;
    const uuidType = uuidColumnType(driverType);
    const timestampType = timestampColumnType(driverType);
    const timestampDefault = nowDefault(driverType);
    const uuidDefaultValue = uuidDefault(driverType);

    await queryRunner.createTable(
      new Table({
        name: 'notification',
        columns: [
          {
            name: 'id',
            type: uuidType,
            isPrimary: true,
            default: uuidDefaultValue,
          },
          {
            name: 'taskId',
            type: uuidType,
          },
          {
            name: 'commentId',
            type: uuidType,
          },
          {
            name: 'userId',
            type: uuidType,
          },
          {
            name: 'read',
            type: 'boolean',
            default: false,
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
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['taskId'],
            referencedTableName: 'task',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['commentId'],
            referencedTableName: 'comment',
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

    await queryRunner.createIndex(
      'notification',
      new TableIndex({
        name: 'IDX_notification_userId_read',
        columnNames: ['userId', 'read'],
      })
    );

    await queryRunner.createIndex(
      'notification',
      new TableIndex({
        name: 'IDX_notification_userId_taskId',
        columnNames: ['userId', 'taskId'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('notification');
    if (table) {
      const index1 = table.indices.find((idx) => idx.name === 'IDX_notification_userId_read');
      const index2 = table.indices.find((idx) => idx.name === 'IDX_notification_userId_taskId');
      if (index1) {
        await queryRunner.dropIndex('notification', index1);
      }
      if (index2) {
        await queryRunner.dropIndex('notification', index2);
      }
    }
    await queryRunner.dropTable('notification');
  }
}

