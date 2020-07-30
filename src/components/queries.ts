import { Database, Q } from '@nozbe/watermelondb';
import withObservables, { ExtractedObservables } from '@nozbe/with-observables';
import { of as of$ } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import UserModel from '!/models/UserModel';
import { Tables } from '!/types';

export interface WithUserAttachmentsInput {
  database: Database;
  userId: string;
}

const getUserAttachments = ({ database, userId }: WithUserAttachmentsInput) => {
  const usersTable = database.collections.get<UserModel>(Tables.users);
  return {
    user: !userId ? of$(null) : usersTable.findAndObserve(userId),
    attachments: !userId
      ? of$(null)
      : usersTable
          .findAndObserve(userId)
          .pipe(
            switchMap(
              (user) => user?.attachments?.extend(Q.where('cipherUri', Q.eq(null))).observe() || of$(null),
            ),
          ) || of$(null),
  };
};

export const withUserAttachments = withObservables(['database', 'userId'], getUserAttachments);

export type WithUserAttachmentsOutput = WithUserAttachmentsInput &
  ExtractedObservables<ReturnType<typeof getUserAttachments>>;
