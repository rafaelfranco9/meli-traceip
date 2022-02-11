import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { GeolocationResponseDto } from './dto/geolocationResponse.dto';

@Injectable()
export class GeolocationService {
  private API_DATA: string;
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.API_DATA = this.configService.get<string>('API_IP2COUNTRY');
  }

  getCountryByIp(ip: string): Observable<GeolocationResponseDto> {
    return this.httpService.get(`${this.API_DATA}/ip?${ip}`).pipe(
      map((response) => {
        return response.data;
      }),
      catchError((error) => {
        return throwError(
          () =>
            new HttpException(
              error.message || 'Invalid IP address',
              error.response.status || HttpStatus.NOT_FOUND,
            ),
        );
      }),
    );
  }
}
