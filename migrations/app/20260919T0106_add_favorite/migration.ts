#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/51e1ad6f51dc48a7d7368c7aff63d1f05b5d876643c3f6ec642e2102b9e28bc5/contract';
import endContract from '../../snapshots/51e1ad6f51dc48a7d7368c7aff63d1f05b5d876643c3f6ec642e2102b9e28bc5/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/e4cefe6119c7b8f420c9b05e42d84ab171c9aabd321304df5072231e6648831b/contract';
import startContract from '../../snapshots/e4cefe6119c7b8f420c9b05e42d84ab171c9aabd321304df5072231e6648831b/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'favorite',
        columns: [
          col('bookId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('userId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'favorite',
        constraint: 'favorite_userId_bookId_key',
        columns: ['userId', 'bookId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'favorite',
        index: 'favorite_bookId_idx_3eec38a3',
        columns: ['bookId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'favorite',
        index: 'favorite_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'favorite',
        foreignKey: {
          name: 'favorite_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'favorite',
        foreignKey: {
          name: 'favorite_bookId_fkey',
          columns: ['bookId'],
          references: { schema: 'public', table: 'book', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
