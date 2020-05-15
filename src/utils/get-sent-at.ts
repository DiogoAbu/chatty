import moment from 'moment';

export default function getSentAt(time: number) {
  return moment(time).calendar(undefined, {
    lastDay: 'LT',
    sameDay: 'LT',
    nextDay: 'LT',
    lastWeek: 'LT',
    nextWeek: 'LT',
    sameElse: 'LT',
  });
}
