import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Render,
} from '@nestjs/common';
import { COORDINATES } from './countries/constants';
import { CountriesService } from './countries/countries.service';
import { CurrenciesService } from './currencies/currencies.service';
import { GeolocationService } from './geolocation/geolocation.service';
import { ICountry } from './countries/interfaces';
import { ClientResponseDto } from './common/dto/clientResponse.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Events } from './statistics/enums/events';
import { StatisticsService } from './statistics/statistics.service';
import { CalculateCoordenatesDistanceInKm } from './countries/helpers';
import { HttpMessages } from './common/enums/exceptions.enums';
@Controller()
export class AppController {
  constructor(
    private geolocationService: GeolocationService,
    private countriesService: CountriesService,
    private currenciesService: CurrenciesService,
    private statisticsService: StatisticsService,
    private eventEmitter: EventEmitter2,
  ) {}

  @Get('ip/:ip')
  async getCountryInformation(@Param('ip') ip: string): Promise<any> {
    try {
      const {countryCode} = await this.geolocationService.getCountryCodeByIp(ip);
      if(!countryCode) throw new NotFoundException(HttpMessages.IP_NOT_FOUND);

      const country:ICountry = await this.countriesService.getCountryInformation(countryCode);
      if(!country) throw new NotFoundException(HttpMessages.COUNTRY_NOT_FOUND);

      country.currencies = await this.currenciesService.getCurrenciesWithUsdRate([...country.currencies]);
      
      const from = COORDINATES.ARGENTINA;
      const to = country.coordinates;
      const distanceInKm = CalculateCoordenatesDistanceInKm(from,to);
      
      const response = new ClientResponseDto(ip,country,{distanceInKm,from,to});
      this.eventEmitter.emit(Events.NEW_COUNTRY_REQUEST,response);
      
      return response;
    } catch (err) {
      throw new NotFoundException(err.message);
    }
  }

  @Get('statistics')
  getStatistics() {
    return this.statisticsService.getStatistics();
  }

  @Get('statistics/all')
  getAllStatistics() {
    return this.statisticsService.getAllRequestDistances();
  }

  @Get()
  @Render('index')
  root() {}
}
