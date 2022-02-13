import { HttpService } from '@nestjs/axios';
import {
  CACHE_MANAGER,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import {
  firstValueFrom,
} from 'rxjs';
import { HttpMessages } from 'src/common/enums/exceptions.enums';
import { CountryResponseDto } from './dto/countryResponse.dto';

@Injectable()
export class CountriesService {
  private API_DATA;
  private logger = new Logger(CountriesService.name);
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
    try {
      let countryData = await this.cacheManager.get<CountryResponseDto>(
        countryCode,
      );
      if (countryData) return countryData;

      const { status, data } = await firstValueFrom(
        this.httpService.get(`${this.API_DATA}/${countryCode}`),
      );
      if (status === HttpStatus.OK && data?.length > 0) {
        const countryResponse = new CountryResponseDto(data[0]);
        await this.cacheManager.set(countryCode, countryResponse);
        return countryResponse;
      }
    } catch (err) {
      this.logger.log(HttpMessages.COUNTRY_NOT_FOUND);
    }

    return null;
  }
}
