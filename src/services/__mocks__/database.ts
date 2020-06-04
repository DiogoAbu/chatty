import { Database } from '@nozbe/watermelondb';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';

import { modelClasses, schema } from '!/models';

export default function createDatabase(): Database {
  const adapter = new LokiJSAdapter({
    dbName: 'chatty_database',
    schema,
  });

  const database = new Database({
    adapter,
    modelClasses,
    actionsEnabled: true,
  });

  return database;
}
