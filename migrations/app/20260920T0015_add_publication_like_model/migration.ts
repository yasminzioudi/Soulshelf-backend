#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/0018e44a0c6098c4957abbbcb86b4237db6b7cee2ee634b2f917b4093202fe07/contract';
import startContract from '../../snapshots/0018e44a0c6098c4957abbbcb86b4237db6b7cee2ee634b2f917b4093202fe07/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/657b18c205890fb571a130131200aaa8d3f3d2966b90b19f98d30b633bef0ee9/contract';
import endContract from '../../snapshots/657b18c205890fb571a130131200aaa8d3f3d2966b90b19f98d30b633bef0ee9/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'publicationLike',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('publicationId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('userId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'publicationLike',
        constraint: 'publicationLike_publicationId_userId_key',
        columns: ['publicationId', 'userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'publicationLike',
        index: 'publicationLike_publicationId_idx_9a426279',
        columns: ['publicationId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'publicationLike',
        index: 'publicationLike_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'publicationLike',
        foreignKey: {
          name: 'publicationLike_publicationId_fkey',
          columns: ['publicationId'],
          references: { schema: 'public', table: 'publication', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'publicationLike',
        foreignKey: {
          name: 'publicationLike_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
