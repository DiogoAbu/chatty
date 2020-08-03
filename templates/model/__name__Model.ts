import UUIDGenerator from 'react-native-uuid-generator';
import { Database, Model, tableSchema } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';
import { Associations } from '@nozbe/watermelondb/Model';

import { DeepPartial } from '!/types';
import limiter from '!/utils/limiter';
import { prepareUpsert, upsert } from '!/utils/upsert';

import Tables from './tables';

class __name__Model extends Model {
  static table = Tables.__name__(snakeCase)s;

  static associations: Associations = {};

  @field('name')
  name: string;
}

export const __name__(camelCase)Schema = tableSchema({
  name: Tables.__name__(snakeCase)s,
  columns: [
    { name: 'name', type: 'string' },
  ],
});

export function __name__(camelCase)Updater(changes: DeepPartial<__name__Model>) {
  return (record: __name__Model) => {
    if (typeof changes.id !== 'undefined') {
      record._raw.id = changes.id;
    }
    if (typeof changes.name !== 'undefined') {
      record.name = changes.name;
    }
  };
}

export async function upsert__name__(
  database: Database,
  __name__(camelCase): DeepPartial<__name__Model>,
  actionParent?: any,
) {
  return upsert<__name__Model>(database, Tables.__name__(snakeCase)s, __name__(camelCase).id, actionParent, __name__(camelCase)Updater(__name__(camelCase)));
}

export async function prepareUpsert__name__(database: Database, __name__(camelCase): DeepPartial<__name__Model>) {
  return prepareUpsert<__name__Model>(database, Tables.__name__(snakeCase)s, __name__(camelCase).id, __name__(camelCase)Updater(__name__(camelCase)));
}

export async function prepare__name__sId(__name__(camelCase)s: DeepPartial<__name__Model>[], filter = true) {
  if (!__name__(camelCase)s) {
    return [];
  }
  let withoutId = __name__(camelCase)s;

  // Get only the ones that do not have ID, will return only the ones with new ID.
  if (filter) {
    withoutId = withoutId.filter((e) => !e.id);
  }

  if (!withoutId.length) {
    return [];
  }

  const wrapped = limiter.wrap(async (__name__(camelCase): DeepPartial<__name__Model>) => {
    const id = __name__(camelCase).id || (await UUIDGenerator.getRandomUUID());
    return { ...__name__(camelCase), id } as DeepPartial<__name__Model>;
  });

  return Promise.all(withoutId.map(wrapped));
}

export default __name__Model;
