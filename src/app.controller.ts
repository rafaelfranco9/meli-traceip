import {
  CACHE_MANAGER,
  Controller,
  Get,
  Inject,
  Param,
  CacheInterceptor,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { firstValueFrom, lastValueFrom, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { COORDINATES } from './countries/constants';
import { CalculateDistanceInKm } from './countries/helpers/countries.helpers';
import { CountriesService } from './countries/countries.service';
import { CountryResponseDto } from './countries/dto/countryResponse.dto';
import { CurrenciesService } from './currencies/currencies.service';
import { GeolocationService } from './geolocation/geolocation.service';
@Controller()
export class AppController {
  constructor(
    private geolocationService: GeolocationService,
    private countriesService: CountriesService,
    private currenciesService: CurrenciesService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Get('ip/:ip')
  async getCountryInformation(@Param('ip') ip: string): Promise<any> {
    try {
      const { countryCode } = await lastValueFrom(
        this.geolocationService.getCountryByIp(ip),
      );
      const country = await lastValueFrom(
        this.countriesService.getCountryInformation(countryCode),
      );
      const exchangeRate = await lastValueFrom(
        this.currenciesService.getExchangeRateInUsd(
          Object.keys(country.currencies)[0],
        ),
      );
      const distance = CalculateDistanceInKm(
        COORDINATES.ARGENTINA,
        country.coordinates,
      );

      return {
        country,
        exchangeRate,
        distance,
      };
    } catch (err) {
      console.log(err.status);
    }
  }
}
