import { ICurrencies } from 'src/currencies/interfaces';
import { coordinate } from 'src/geolocation/interfaces';

export interface ICountry {
  spanishName: string;
  commonName: string;
  ISOcode: string;
  languages: Record<string, string>;
  timezones: ITimezone[];
  currencies: ICurrencies[];
  coordinates:coordinate;
}

export interface ITimezone {
  utcOverflow: number;
  time: string;
}


