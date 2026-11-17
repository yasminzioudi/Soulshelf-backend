#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/0f937a71d54594a9c2143728248c72f2cafa7faaec35e9aa8f48d41e65423ab8/contract';
import startContract from '../../snapshots/0f937a71d54594a9c2143728248c72f2cafa7faaec35e9aa8f48d41e65423ab8/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/37b03c497845205a701c95e1f3dff8d38f074b76be77dae3b3329408d7d53c48/contract';
import endContract from '../../snapshots/37b03c497845205a701c95e1f3dff8d38f074b76be77dae3b3329408d7d53c48/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'book',
        column: col('language', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'book',
        column: col('pages', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'book',
        column: col('publishedYear', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('bio', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('occupation', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
