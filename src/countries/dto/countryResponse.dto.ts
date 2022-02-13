import { ICurrencies } from 'src/currencies/interfaces';
import { Coordinates } from 'src/geolocation/types';
import {
  convertToCurrency,
  convertToTimezone,
} from '../helpers/dto.helpers';
import { ICountry, ITimezone } from '../interfaces';

export class CountryResponseDto implements ICountry {
  spanishName: string;
  commonName: string;
  ISOcode: string;
  languages: Record<string, string>;
  timezones: ITimezone[];
  currencies: ICurrencies[];
  coordinates: Coordinates;

  constructor(body: any) {
    this.spanishName = body.translations.spa.common;
    this.commonName = body.name.common;
    this.ISOcode = body.cca2;
    this.coordinates = body.latlng;
    this.languages = body.languages;
    this.currencies = convertToCurrency(body.currencies);
    this.timezones = convertToTimezone(body.timezones);
  }
}
