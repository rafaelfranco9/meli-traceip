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
import { CountryResponseDto } from './dto/countryResponse.dto';

@Injectable()
export class CountriesService {
  private API_DATA;
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.API_DATA = this.configService.get<string>('API_COUNTRIES_CODE');
  }

  async getCountryInformation(
    countryCode: string,
  ): Promise<CountryResponseDto | null> {
    let countryData = await this.cacheManager.get<CountryResponseDto>(
      countryCode,
    );
    if (!countryData) {
      countryData = await lastValueFrom(
        this.httpService.get(`${this.API_DATA}/${countryCode}`).pipe(
          map((response) => {
            const { status, data } = response;
            if (status == HttpStatus.OK && data.length > 0) {
              const countryResponse = new CountryResponseDto(data[0]);
              this.cacheManager.set(countryCode, countryResponse);
              return countryResponse;
            }
            return null;
          }),
          catchError((error) => {
            return throwError(
              () =>
                new HttpException(
                  error.message || 'Error requesting data to api',
                  error.status || HttpStatus.NOT_FOUND,
                ),
            );
          }),
        ),
      );
    }

    return countryData;
  }
}
