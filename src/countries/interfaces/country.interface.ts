import { ICurrencies } from 'src/currencies/interfaces';
import { Coordinates } from 'src/geolocation/types';

import { ITimezone } from '.';

export interface ICountry {
  spanishName: string;
  commonName: string;
  ISOcode: string;
  languages: Record<string, string>;
  timezones: ITimezone[];
  currencies: ICurrencies[];
  coordinates: Coordinates;
}
