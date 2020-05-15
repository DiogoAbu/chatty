import { addColumns } from '@nozbe/watermelondb/Schema/migrations';

import { Tables } from '!/types';

export const to5 = {
  toVersion: 5,
  steps: [
    addColumns({
      table: Tables.attachments,
      columns: [
        { name: 'width', type: 'number' },
        { name: 'height', type: 'number' },
      ],
    }),
  ],
};
