#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/0f937a71d54594a9c2143728248c72f2cafa7faaec35e9aa8f48d41e65423ab8/contract';
import endContract from '../../snapshots/0f937a71d54594a9c2143728248c72f2cafa7faaec35e9aa8f48d41e65423ab8/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/f57cf2e4ed22e52e2546d0912068cbd1e3135865994500e2f82f0f437ac3d359/contract';
import startContract from '../../snapshots/f57cf2e4ed22e52e2546d0912068cbd1e3135865994500e2f82f0f437ac3d359/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, lit, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'friendRequest',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('receiverId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('senderId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('PENDING'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'friendRequest',
        constraint: 'friendRequest_senderId_receiverId_key',
        columns: ['senderId', 'receiverId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'friendRequest',
        index: 'friendRequest_receiverId_idx_fe124f44',
        columns: ['receiverId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'friendRequest',
        index: 'friendRequest_senderId_idx_4689c490',
        columns: ['senderId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'friendRequest',
        index: 'friendRequest_status_idx_e98638ab',
        columns: ['status'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'friendRequest',
        foreignKey: {
          name: 'friendRequest_senderId_fkey',
          columns: ['senderId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'friendRequest',
        foreignKey: {
          name: 'friendRequest_receiverId_fkey',
          columns: ['receiverId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
