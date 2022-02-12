import {
  Body,
  CACHE_MANAGER,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
  Render,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { lastValueFrom } from 'rxjs';
import { COORDINATES } from './countries/constants';
import { CountriesService } from './countries/countries.service';
import { CurrenciesService } from './currencies/currencies.service';
import { GeolocationService } from './geolocation/geolocation.service';
import { ICountry } from './countries/interfaces';
import { ClientResponseDto } from './common/dto/clientResponse.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Events } from './statistics/enums/events';
import { get } from 'http';
import { StatisticsService } from './statistics/statistics.service';
@Controller()
export class AppController {
  constructor(
    private geolocationService: GeolocationService,
    private countriesService: CountriesService,
    private currenciesService: CurrenciesService,
    private statisticsService: StatisticsService,
    private eventEmitter: EventEmitter2,
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

      //await this.currenciesService.setUsdRates(country.currencies);

      const ClientResponse = new ClientResponseDto(
        ip,
        country,
        COORDINATES.ARGENTINA,
      );

      this.eventEmitter.emit(Events.NEW_COUNTRY_REQUEST, ClientResponse);

      return ClientResponse;
    } catch (err) {
      throw new NotFoundException(err.message);
    }
  }

  @Get('statistics')
  getStatistics() {
    return this.statisticsService.getStatistics();
  }

  @Get()
  @Render('index')
  root() {}
}
