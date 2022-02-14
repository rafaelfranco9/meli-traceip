import {
  CACHE_MANAGER,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import {
  firstValueFrom,
} from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { GeolocationResponseDto } from './dto/geolocationResponse.dto';
import { Cache } from 'cache-manager';
import { HttpMessages } from '../common/enums/exceptions.enums';


@Injectable()
export class GeolocationService {
  private API_DATA: string;
  private logger = new Logger(GeolocationService.name);
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.API_DATA = this.configService.get<string>('API_IP2COUNTRY');
  }

  async getCountryCodeByIp(ip: string): Promise<GeolocationResponseDto | null> {
    try {
      let code = await this.cacheManager.get<GeolocationResponseDto>(ip);
      if (code) return code;

      const { status, data } = await firstValueFrom(
        this.httpService.get(`${this.API_DATA}/ip?${ip}`),
      );
      if (status === HttpStatus.OK) {
        const geoResponse = new GeolocationResponseDto(data);
        await this.cacheManager.set(ip, geoResponse);
        return geoResponse;
      }
    } catch (err) {
      this.logger.log(HttpMessages.IP_NOT_FOUND);
    }
    return null;
  }
}
