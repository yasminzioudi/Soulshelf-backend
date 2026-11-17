#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/1c40e6520420c7238750328bdce8dc36a2a66a617753a7901d6ab7077408c44a/contract';
import endContract from '../../snapshots/1c40e6520420c7238750328bdce8dc36a2a66a617753a7901d6ab7077408c44a/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/37b03c497845205a701c95e1f3dff8d38f074b76be77dae3b3329408d7d53c48/contract';
import startContract from '../../snapshots/37b03c497845205a701c95e1f3dff8d38f074b76be77dae3b3329408d7d53c48/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, lit, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'publication',
        columns: [
          col('authorId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('content', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('coverUrl', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('genre', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('language', 'text', { default: lit('English'), codecRef: { codecId: 'pg/text@1' } }),
          col('pages', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('publishedYear', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createIndex({
        schema: 'public',
        table: 'publication',
        index: 'publication_authorId_idx_e47547ed',
        columns: ['authorId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'publication',
        foreignKey: {
          name: 'publication_authorId_fkey',
          columns: ['authorId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
