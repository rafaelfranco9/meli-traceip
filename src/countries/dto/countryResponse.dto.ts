import { ICurrencies } from 'src/currencies/interfaces';
import { coordinate } from 'src/geolocation/interfaces';
import { convertToCurrency, getUTCtime } from '../helpers/countries.helpers';
import { ICountry, ITimezone } from '../interfaces';

export class CountryResponseDto implements ICountry {
  spanishName: string;
  commonName: string;
  ISOcode: string;
  languages: Record<string, string>;
  timezones: ITimezone[];
  currencies: ICurrencies[];
  coordinates: coordinate;

  constructor(body: any) {
    this.spanishName = body.translations.spa.common;
    this.commonName = body.name.common;
    this.ISOcode = body.cca2;
    this.currencies = convertToCurrency(body.currencies);
    this.coordinates = body.latlng;
    this.languages = body.languages;
    this.timezones = body.timezones.map((time: string) =>
      getUTCtime(time),
    ) as ITimezone[];
  }
}
