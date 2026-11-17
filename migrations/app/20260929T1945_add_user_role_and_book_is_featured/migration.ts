#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/222a291de20b279becb76a7567c7df211b7b76eb8a0a5e5cbe01c1c493fb7c08/contract';
import startContract from '../../snapshots/222a291de20b279becb76a7567c7df211b7b76eb8a0a5e5cbe01c1c493fb7c08/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/dbdd884c347f1c49025ef2e5686fc33fddddffaac62b2e5489f4480ac8d9e193/contract';
import endContract from '../../snapshots/dbdd884c347f1c49025ef2e5686fc33fddddffaac62b2e5489f4480ac8d9e193/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'book',
        column: col('isFeatured', 'bool', {
          notNull: true,
          default: lit(false),
          codecRef: { codecId: 'pg/bool@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('role', 'text', {
          notNull: true,
          default: lit('USER'),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
      this.createIndex({
        schema: 'public',
        table: 'book',
        index: 'book_isFeatured_idx_4ec5a125',
        columns: ['isFeatured'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
