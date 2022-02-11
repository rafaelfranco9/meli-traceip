import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, map, Observable, throwError } from 'rxjs';
import { CurrencyCodes } from './enums';

@Injectable()
export class CurrenciesService {
  private API_DATA;
  private ACCESS_KEY;
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.API_DATA = this.configService.get('API_FIXER');
    this.ACCESS_KEY = this.configService.get('FIXER_ACCESS_KEY');
  }

  getExchangeRateInUsd(currencyCode: string): Observable<number | null> {
    return this.httpService
      .get(
        `${this.API_DATA}/latest?access_key=${this.ACCESS_KEY}&symbols=${CurrencyCodes.USD},${currencyCode}`,
      )
      .pipe(
        map((response) => {
          if (response.status == HttpStatus.OK) {
            return response.data;
          } else {
            throwError(() => new Error('Error requesting exchange data'));
          }
        }),
        map((data) => {
          if (currencyCode == CurrencyCodes.USD) return 1;
          return this.calculateExchangeRateInUsd(currencyCode, data.rates);
        }),
        catchError((err) => {
          return throwError(
            () => new HttpException(err.message, HttpStatus.NOT_FOUND),
          );
        }),
      );
  }

  calculateExchangeRateInUsd(
    currencyCode: string,
    EURBaseRates: number | null,
  ) {
    const code = currencyCode.toUpperCase();
    if (EURBaseRates[code] != null && EURBaseRates[CurrencyCodes.USD] != null) {
      const usdRate = 1 / EURBaseRates[CurrencyCodes.USD];
      const currencyRate = usdRate * EURBaseRates[code];
      const exchangeRate = 1 / currencyRate;
      return exchangeRate;
    }
    return null;
  }
}
