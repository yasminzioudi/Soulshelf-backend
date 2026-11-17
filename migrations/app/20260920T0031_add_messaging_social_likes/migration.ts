#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/222a291de20b279becb76a7567c7df211b7b76eb8a0a5e5cbe01c1c493fb7c08/contract';
import endContract from '../../snapshots/222a291de20b279becb76a7567c7df211b7b76eb8a0a5e5cbe01c1c493fb7c08/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/fa478349cd0e766021b7c7d8bc430d92fb0ee0d9fd95437aeb11be0425c95034/contract';
import startContract from '../../snapshots/fa478349cd0e766021b7c7d8bc430d92fb0ee0d9fd95437aeb11be0425c95034/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropConstraint({
        schema: 'public',
        table: 'publicationLike',
        constraint: 'publicationLike_publicationId_userId_key',
      }),
      this.addUnique({
        schema: 'public',
        table: 'publicationLike',
        constraint: 'publicationLike_userId_publicationId_key',
        columns: ['userId', 'publicationId'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
