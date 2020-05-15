import { addColumns } from '@nozbe/watermelondb/Schema/migrations';

import { Tables } from '!/types';

export const to2 = {
  toVersion: 2,
  steps: [
    addColumns({
      table: Tables.rooms,
      columns: [{ name: 'is_archived', type: 'boolean' }],
    }),
  ],
};
