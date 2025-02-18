import { addColumns } from '@nozbe/watermelondb/Schema/migrations';

import { Tables } from '!/types';

export const to4 = {
  toVersion: 4,
  steps: [
    addColumns({
      table: Tables.rooms,
      columns: [{ name: 'pictureUri', type: 'string', isOptional: true }],
    }),
  ],
};
