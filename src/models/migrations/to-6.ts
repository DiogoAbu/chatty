import { addColumns } from '@nozbe/watermelondb/Schema/migrations';

import { Tables } from '!/types';

export const to6 = {
  toVersion: 6,
  steps: [
    addColumns({
      table: Tables.attachments,
      columns: [{ name: 'remoteUri', type: 'string' }],
    }),
  ],
};
