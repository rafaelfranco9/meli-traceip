import { CurrencyCodes } from 'src/currencies/enums';
import { calculateExchangeRateInUsd } from 'src/currencies/helpers';
import { ICurrencies } from 'src/currencies/interfaces';
import { Coordinates } from 'src/geolocation/types';
import { apiResponse } from './dto/apiResponse.dto';
import { getUTCtime } from './helpers';
import { convertToCurrency, convertToTimezone } from './helpers/dto.helpers';
import { ICountry, ITimezone } from './interfaces';

export class Country implements ICountry {
  spanishName: string;
  commonName: string;
  ISOcode: string;
  languages: Record<string, string>;
  timezones: ITimezone[];
  currencies: ICurrencies[];
  coordinates: Coordinates;

  constructor(body: apiResponse) {
    this.spanishName = body.translations.spa.common || body.name.common;
    this.commonName = body.name.common;
    this.ISOcode = body.cca2;
    this.coordinates = body.latlng;
    this.languages = body.languages;
    this.currencies = convertToCurrency(body.currencies);
    this.timezones = convertToTimezone(body.timezones);
  }

  updateTimezones() {
    this.timezones = this.timezones.map((timezone) => {
      return getUTCtime(timezone.utcOverflow);
    });
  }

  updateCurrenciesExchangeRate(rates: Record<string, number>) {
    this.currencies = this.currencies.map((currency) => {
      if (currency.code == CurrencyCodes.USD) {
        currency.usdRate = 1;
      } else if (
        rates[currency.code] != null &&
        rates[CurrencyCodes.USD] != null
      ) {
        currency.usdRate = calculateExchangeRateInUsd(
          rates[CurrencyCodes.USD],
          rates[currency.code],
        );
      }
      return currency;
    });
  }
}
