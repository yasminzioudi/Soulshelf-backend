#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/0018e44a0c6098c4957abbbcb86b4237db6b7cee2ee634b2f917b4093202fe07/contract';
import endContract from '../../snapshots/0018e44a0c6098c4957abbbcb86b4237db6b7cee2ee634b2f917b4093202fe07/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/1c40e6520420c7238750328bdce8dc36a2a66a617753a7901d6ab7077408c44a/contract';
import startContract from '../../snapshots/1c40e6520420c7238750328bdce8dc36a2a66a617753a7901d6ab7077408c44a/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'follow',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('followerId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('followingId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'follow',
        constraint: 'follow_followerId_followingId_key',
        columns: ['followerId', 'followingId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'follow',
        index: 'follow_followerId_idx_2aa6c62d',
        columns: ['followerId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'follow',
        index: 'follow_followingId_idx_1cf16645',
        columns: ['followingId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'follow',
        foreignKey: {
          name: 'follow_followerId_fkey',
          columns: ['followerId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'follow',
        foreignKey: {
          name: 'follow_followingId_fkey',
          columns: ['followingId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
