import moment from 'moment';

export default function getSentAt(time: number): string {
  return moment(time).calendar(undefined, {
    lastDay: 'LT',
    sameDay: 'LT',
    nextDay: 'LT',
    lastWeek: 'LT',
    nextWeek: 'LT',
    sameElse: 'LT',
  });
}
