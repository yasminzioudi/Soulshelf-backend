#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/51e1ad6f51dc48a7d7368c7aff63d1f05b5d876643c3f6ec642e2102b9e28bc5/contract';
import startContract from '../../snapshots/51e1ad6f51dc48a7d7368c7aff63d1f05b5d876643c3f6ec642e2102b9e28bc5/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/ac3204f04f9e7c8aa2189d1c12be9cb267df71be2c71f2d9e9c5d028e0b95d2d/contract';
import endContract from '../../snapshots/ac3204f04f9e7c8aa2189d1c12be9cb267df71be2c71f2d9e9c5d028e0b95d2d/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, lit, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'chapter',
        columns: [
          col('bookId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('chapterNum', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('content', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'readingProgress',
        columns: [
          col('bookId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('currentChapter', 'int4', {
            notNull: true,
            default: lit(1),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('userId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'chapter',
        constraint: 'chapter_bookId_chapterNum_key',
        columns: ['bookId', 'chapterNum'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'readingProgress',
        constraint: 'readingProgress_userId_bookId_key',
        columns: ['userId', 'bookId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'chapter',
        index: 'chapter_bookId_idx_3eec38a3',
        columns: ['bookId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'readingProgress',
        index: 'readingProgress_bookId_idx_3eec38a3',
        columns: ['bookId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'readingProgress',
        index: 'readingProgress_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'chapter',
        foreignKey: {
          name: 'chapter_bookId_fkey',
          columns: ['bookId'],
          references: { schema: 'public', table: 'book', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'readingProgress',
        foreignKey: {
          name: 'readingProgress_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'readingProgress',
        foreignKey: {
          name: 'readingProgress_bookId_fkey',
          columns: ['bookId'],
          references: { schema: 'public', table: 'book', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
