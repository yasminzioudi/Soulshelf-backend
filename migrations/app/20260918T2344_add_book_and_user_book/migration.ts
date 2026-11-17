#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/aec2c2e30636918483b7b5ef43176fff9a5a1881b1f660a5991da4329bf10bf6/contract';
import startContract from '../../snapshots/aec2c2e30636918483b7b5ef43176fff9a5a1881b1f660a5991da4329bf10bf6/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/e4cefe6119c7b8f420c9b05e42d84ab171c9aabd321304df5072231e6648831b/contract';
import endContract from '../../snapshots/e4cefe6119c7b8f420c9b05e42d84ab171c9aabd321304df5072231e6648831b/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, lit, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'book',
        columns: [
          col('author', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('coverColor', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('coverImage', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('genre', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'userBook',
        columns: [
          col('addedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('bookId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('OWNED'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('userId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'userBook',
        constraint: 'userBook_userId_bookId_key',
        columns: ['userId', 'bookId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'userBook',
        index: 'userBook_bookId_idx_3eec38a3',
        columns: ['bookId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'userBook',
        index: 'userBook_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'userBook',
        foreignKey: {
          name: 'userBook_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'userBook',
        foreignKey: {
          name: 'userBook_bookId_fkey',
          columns: ['bookId'],
          references: { schema: 'public', table: 'book', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
