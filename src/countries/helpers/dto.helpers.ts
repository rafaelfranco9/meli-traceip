import { ICurrencies } from 'src/currencies/interfaces';
import { ITimezone } from '../interfaces';
import { getUTCtime } from './time.helpers';

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

export function convertToTimezone(apiTimezones: string[]): ITimezone[] {
  return apiTimezones.map((time: string) => getUTCtime(time));
}
