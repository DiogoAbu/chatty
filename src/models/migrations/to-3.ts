import { addColumns } from '@nozbe/watermelondb/Schema/migrations';

import { Tables } from '!/types';

export const to3 = {
  toVersion: 3,
  steps: [
    addColumns({
      table: Tables.users,
      columns: [{ name: 'picture_uri', type: 'string' }],
    }),
  ],
};
