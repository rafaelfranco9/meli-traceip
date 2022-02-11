import { coordinate } from "../interfaces";

export class CountryResponseDto {
  public nameInSpanish: string;
  public name: string;
  public ISOcode: string;
  public currencies: Record<string, currencyDetails>;
  public coordinates: coordinate;
  public timezones: string[];
  public languages: Record<string, string>;
  constructor(body: any) {
    this.nameInSpanish = body.translations.spa.common;
    this.name = body.name.common;
    this.ISOcode = body.cca2;
    this.currencies = body.currencies;
    this.coordinates = body.latlng;
    this.languages = body.languages;
    this.timezones = body.timezones;
  }
}

interface currencyDetails {
  name: string;
  symbol: string;
}


