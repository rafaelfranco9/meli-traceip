import { ITimezone } from '../interfaces';

export function getUTCtime(apiTimezone: string): ITimezone {
  const date = new Date();
  const overflowInMilliseconds = convertTimeToMilliseconds(apiTimezone);
  const time = new Date(
    date.setTime(date.getTime() + overflowInMilliseconds),
  ).toISOString();
  const timeFormatted = time.split('T')[1].split('.')[0];
  const timezone: ITimezone = {
    utcOverflow: apiTimezone,
    time: timeFormatted,
  };
  return timezone;
}

export function convertTimeToMilliseconds(utctime: string): number {
  if (utctime.length > 3) {
    const time = utctime.slice(utctime.length - 5, utctime.length);
    const hours = +time.split(':')[0] * 60 * 60 * 1000;
    const minutes = +time.split(':')[1] * 60 * 1000;
    const totalMilliseconds = hours + minutes;
    if (utctime.charAt(3) == '-') return -totalMilliseconds;
    return totalMilliseconds;
  }
  return 0;
}

export function formatDateTime(date: Date): string {
  return date.toISOString().replace('T', ' ').replace(/\..+/, '');
}
