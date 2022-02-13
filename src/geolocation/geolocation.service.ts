import {
  CACHE_MANAGER,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom, map, Observable, throwError } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { GeolocationResponseDto } from './dto/geolocationResponse.dto';
import { Cache } from 'cache-manager';

@Injectable()
export class GeolocationService {
  private API_DATA: string;
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.API_DATA = this.configService.get<string>('API_IP2COUNTRY');
  }

  async getCountryCodeByIp(ip: string): Promise<GeolocationResponseDto | null> {
    let code = await this.cacheManager.get<GeolocationResponseDto>(ip);
    if (!code) {
      code = await lastValueFrom(
        this.httpService
          .get<GeolocationResponseDto | null>(`${this.API_DATA}/ip?${ip}`)
          .pipe(
            map((response) => {
              const { status, data } = response;
              if (status == HttpStatus.OK) {
                this.cacheManager.set(ip, code);
                return new GeolocationResponseDto(data);
              }
              return null;
            }),
            catchError((error) => {
              return throwError(
                () =>
                  new HttpException(
                    error.message || 'Error requesting data to api',
                    error.response.status || HttpStatus.NOT_FOUND,
                  ),
              );
            }),
          ),
      );
    }
    return code;
  }
}
