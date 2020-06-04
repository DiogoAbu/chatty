import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import { migrations, modelClasses, schema } from '!/models';

export default function createDatabase(): Database {
  const adapter = new SQLiteAdapter({
    dbName: 'chatty_database',
    schema,
    migrations,
  });

  const database = new Database({
    adapter,
    modelClasses,
    actionsEnabled: true,
  });

  return database;
}
