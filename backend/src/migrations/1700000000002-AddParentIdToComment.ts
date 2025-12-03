import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

const uuidColumnType = (driver: QueryRunner['connection']['options']['type']) =>
  driver === 'sqlite' ? 'varchar' : 'uuid';

export class AddParentIdToComment1700000000002 implements MigrationInterface {
  name = 'AddParentIdToComment1700000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const driverType = queryRunner.connection.options.type;
    const uuidType = uuidColumnType(driverType);

    // Add parentId column
    await queryRunner.addColumn(
      'comment',
      new TableColumn({
        name: 'parentId',
        type: uuidType,
        isNullable: true,
      }),
    );

    // Add foreign key constraint
    await queryRunner.createForeignKey(
      'comment',
      new TableForeignKey({
        columnNames: ['parentId'],
        referencedTableName: 'comment',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('comment');
    const foreignKey = table?.foreignKeys.find((fk) => fk.columnNames.indexOf('parentId') !== -1);
    if (foreignKey) {
      await queryRunner.dropForeignKey('comment', foreignKey);
    }
    await queryRunner.dropColumn('comment', 'parentId');
  }
}

