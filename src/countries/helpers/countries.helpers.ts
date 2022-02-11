import { ICurrencies } from 'src/currencies/interfaces';
import { coordinate } from 'src/geolocation/interfaces';
import { ITimezone } from '../interfaces';

export function CalculateDistanceInKm(
  coordinate1: coordinate,
  coordinate2: coordinate,
) {
  const EARTH_RADIUS_KM = 6371;

  const latitude1 = degreesToRadians(coordinate1[0]);
  const longitude1 = degreesToRadians(coordinate1[1]);
  const latitude2 = degreesToRadians(coordinate2[0]);
  const longitude2 = degreesToRadians(coordinate2[1]);

  //Haversine formula
  const latitudeDistance = latitude2 - latitude1;
  const longitudeDistance = longitude2 - longitude1;
  const a =
    Math.pow(Math.sin(latitudeDistance / 2), 2) +
    Math.cos(latitude1) *
      Math.cos(latitude2) *
      Math.pow(Math.sin(longitudeDistance / 2), 2);

  const c = 2 * Math.asin(Math.sqrt(a));
  const distance = EARTH_RADIUS_KM * c;

  return +distance.toFixed(0);
}

export function degreesToRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

export function convertToCurrency(
  apiCurrencyProperty: Record<string, { name: string; symbol: string }>,
): ICurrencies[] {
  return Object.entries(apiCurrencyProperty).reduce((acc, [code, details]) => {
    const newCurrency: ICurrencies = {
      code,
      name: details.name,
      symbol: details.symbol,
      usdRate: 0,
    };
    return [newCurrency, ...acc];
  }, [] as ICurrencies[]);
}

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
