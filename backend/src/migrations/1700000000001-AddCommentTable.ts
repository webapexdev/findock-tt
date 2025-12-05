import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

const uuidColumnType = (driver: QueryRunner['connection']['options']['type']) =>
  driver === 'sqlite' ? 'varchar' : 'uuid';

const timestampColumnType = (driver: QueryRunner['connection']['options']['type']) =>
  driver === 'sqlite' ? 'datetime' : 'timestamp';

const nowDefault = (driver: QueryRunner['connection']['options']['type']) =>
  driver === 'sqlite' ? 'CURRENT_TIMESTAMP' : 'now()';

const uuidDefault = (driver: QueryRunner['connection']['options']['type']) =>
  driver === 'sqlite' ? undefined : 'gen_random_uuid()';

export class AddCommentTable1700000000001 implements MigrationInterface {
  name = 'AddCommentTable1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const driverType = queryRunner.connection.options.type;
    const uuidType = uuidColumnType(driverType);
    const timestampType = timestampColumnType(driverType);
    const timestampDefault = nowDefault(driverType);
    const uuidDefaultValue = uuidDefault(driverType);

    await queryRunner.createTable(
      new Table({
        name: 'comment',
        columns: [
          {
            name: 'id',
            type: uuidType,
            isPrimary: true,
            default: uuidDefaultValue,
          },
          {
            name: 'content',
            type: 'text',
          },
          {
            name: 'taskId',
            type: uuidType,
          },
          {
            name: 'authorId',
            type: uuidType,
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
            columnNames: ['authorId'],
            referencedTableName: 'user',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('comment');
  }
}



