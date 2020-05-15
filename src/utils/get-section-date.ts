import moment from 'moment';

// "[Today at] LT " => "Today"
function getFirstWordBetweenBrackets(string: string) {
  return string.match(/([^\s[\]]+)/g)?.[0];
}

export default function getSectionDate(time: number) {
  return moment(time).calendar(undefined, {
    sameElse: 'DD/MM/YYYY',
    lastWeek: 'dddd',
    lastDay(now) {
      // @ts-ignore
      // eslint-disable-next-line no-underscore-dangle
      let lastDay = now._locale._calendar.lastDay;
      if (typeof lastDay === 'function') {
        lastDay = lastDay.call(this);
      }

      const date = getFirstWordBetweenBrackets(lastDay);
      if (date) {
        return `[${date}]`;
      }
      return lastDay;
    },
    sameDay(now) {
      // @ts-ignore
      // eslint-disable-next-line no-underscore-dangle
      let sameDay = now._locale._calendar.sameDay;
      if (typeof sameDay === 'function') {
        sameDay = sameDay.call(this);
      }

      const date = getFirstWordBetweenBrackets(sameDay);
      if (date) {
        return `[${date}]`;
      }
      return sameDay;
    },
  });
}
