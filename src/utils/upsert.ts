import { Database, Model } from '@nozbe/watermelondb';
import { Clause } from '@nozbe/watermelondb/QueryDescription';

import { Tables } from '!/types';

export async function upsert<T extends Model>(
  database: Database,
  tableName: Tables,
  idOrQuery: string | Clause[] | undefined,
  action?: any,
  recordUpdater?: ((record: T, creating: boolean) => void) | undefined,
): Promise<T> {
  const collection = database.collections.get<T>(tableName);

  try {
    if (!idOrQuery) {
      throw null;
    }

    let found: T;

    if (typeof idOrQuery === 'string') {
      // Find by id
      found = await collection.find(idOrQuery);
    } else {
      // Pass query, fetch it and get first element
      found = (await collection.query(...idOrQuery).fetch())?.[0];
    }

    if (!found) {
      throw null;
    }

    if (action) {
      await action.subAction(async () => {
        await found.update((record) => recordUpdater?.(record, false));
      });
    } else {
      await database.action<T>(async () => {
        await found.update((record) => recordUpdater?.(record, false));
      }, 'upsert-update-' + tableName);
    }

    return found;
  } catch {
    if (action) {
      return await action.subAction(async () => {
        return collection.create((record) => recordUpdater?.(record, true));
      });
    }
    return await database.action<T>(async () => {
      return collection.create((record) => recordUpdater?.(record, true));
    }, 'upsert-create-' + tableName);
  }
}

export async function prepareUpsert<T extends Model>(
  database: Database,
  tableName: Tables,
  idOrQuery: string | Clause[] | undefined,
  recordUpdater?: ((record: T, creating: boolean) => void) | undefined,
): Promise<T> {
  const collection = database.collections.get<T>(tableName);

  try {
    if (!idOrQuery) {
      throw null;
    }

    let found: T;

    if (typeof idOrQuery === 'string') {
      // Find by id
      found = await collection.find(idOrQuery);
    } else {
      // Pass query, fetch it and get first element
      found = (await collection.query(...idOrQuery).fetch())?.[0];
    }

    if (!found) {
      throw null;
    }

    return found.prepareUpdate((record) => recordUpdater?.(record, false));
  } catch {
    return collection.prepareCreate((record) => recordUpdater?.(record, true));
  }
}
