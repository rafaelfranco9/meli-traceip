import { ICurrencies } from 'src/currencies/interfaces';

export interface ICountry {
  spanishName: string;
  commonName: string;
  ISOcode: string;
  languages: Record<string, string>;
  timezone: ITimezone[];
  currencies: ICurrencies[];
}

export interface ITimezone {
  utcOverflow: number;
  time: string;
}

export type coordinate = [number, number];
