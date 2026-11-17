#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/381b125ad957b8a660820d7e525e393887f44b00095428ef45dfa0287679fd86/contract';
import startContract from '../../snapshots/381b125ad957b8a660820d7e525e393887f44b00095428ef45dfa0287679fd86/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/aec2c2e30636918483b7b5ef43176fff9a5a1881b1f660a5991da4329bf10bf6/contract';
import endContract from '../../snapshots/aec2c2e30636918483b7b5ef43176fff9a5a1881b1f660a5991da4329bf10bf6/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'passwordResetCode',
        columns: [
          col('codeHash', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('expiresAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('usedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('userId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createIndex({
        schema: 'public',
        table: 'passwordResetCode',
        index: 'passwordResetCode_codeHash_idx_21abea01',
        columns: ['codeHash'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'passwordResetCode',
        index: 'passwordResetCode_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'passwordResetCode',
        foreignKey: {
          name: 'passwordResetCode_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
