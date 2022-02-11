import { HttpService } from '@nestjs/axios';
import {
  CACHE_MANAGER,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { catchError, lastValueFrom, map, throwError } from 'rxjs';
import { CurrencyCodes } from './enums';
import { ICurrencies } from './interfaces';

@Injectable()
export class CurrenciesService {
  private API_DATA;
  private ACCESS_KEY;
  private CACHE_RATES_KEY: string = 'RATES';
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.API_DATA = this.configService.get('API_FIXER');
    this.ACCESS_KEY = this.configService.get('FIXER_ACCESS_KEY');
  }

  async setUsdRates(currencies: ICurrencies[]) {
    let rates = await this.cacheManager.get(this.CACHE_RATES_KEY);
    if (!rates) {
      rates = await this.getLastestRates();
    }
    currencies.map((currency) => {
      if (currency.code == CurrencyCodes.USD) {
        currency.usdRate = 1;
      } else if (
        rates[currency.code] != null &&
        rates[CurrencyCodes.USD] != null
      ) {
        currency.usdRate = this.calculateExchangeRateInUsd(
          rates[CurrencyCodes.USD],
          rates[currency.code],
        );
      }
    });
  }

  async getLastestRates(): Promise<Record<string, number>> {
    return await lastValueFrom(
      this.httpService
        .get(`${this.API_DATA}/latest?access_key=${this.ACCESS_KEY}`)
        .pipe(
          map((response) => {
            if (response.status == HttpStatus.OK) {
              return response.data.rates;
            } else {
              throwError(() => new Error('Error requesting exchange data'));
            }
          }),
          map((rates) => {
            this.cacheManager.set(this.CACHE_RATES_KEY, rates);
            return rates;
          }),
          catchError((err) => {
            return throwError(
              () => new HttpException(err.message, HttpStatus.NOT_FOUND),
            );
          }),
        ),
    );
  }

  calculateExchangeRateInUsd(usdRate: number, currencyRate: number) {
    const usd = 1 / usdRate;
    const currRate = usd * currencyRate;
    const exchangeRate = 1 / currRate;
    return +exchangeRate.toFixed(5);
  }
}
