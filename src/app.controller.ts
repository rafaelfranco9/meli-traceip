import { CACHE_MANAGER, Controller, Get, Inject, Param } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { lastValueFrom } from 'rxjs';
import { COORDINATES } from './countries/constants';
import { CountriesService } from './countries/countries.service';
import { CurrenciesService } from './currencies/currencies.service';
import { GeolocationService } from './geolocation/geolocation.service';
import { ICountry } from './countries/interfaces';
import { ClientResponseDto } from './common/dto/clientResponse.dto';
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
      let country: ICountry = await this.cacheManager.get(ip);
      if (!country) {
        const { countryCode } = await lastValueFrom(
          this.geolocationService.getCountryByIp(ip),
        );
        country = await lastValueFrom(
          this.countriesService.getCountryInformation(countryCode),
        );
        this.cacheManager.set(ip, country);
      }

      await this.currenciesService.setUsdRates(country.currencies);

      const response = new ClientResponseDto(
        ip,
        country,
        COORDINATES.ARGENTINA,
      );
      return response;
    } catch (err) {
      console.log(err.status);
    }
  }
}
