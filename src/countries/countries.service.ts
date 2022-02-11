import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, map, Observable, throwError } from 'rxjs';
import { CurrenciesService } from 'src/currencies/currencies.service';
import { CountryResponseDto } from './dto/countryResponse.dto';

@Injectable()
export class CountriesService {
  private API_DATA;
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.API_DATA = this.configService.get<string>('API_COUNTRIES_CODE');
  }

  getCountryInformation(countryCode: string): Observable<CountryResponseDto> {
    return this.httpService.get<any>(`${this.API_DATA}/${countryCode}`).pipe(
      map((response) => response.data[0]),
      map((body) => {
        return new CountryResponseDto(body);
      }),
      catchError((error) => {
        return throwError(
          () =>
            new HttpException(
              error.message || 'Country not found',
              error.status || HttpStatus.NOT_FOUND,
            ),
        );
      }),
    );
  }

  

}
