import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER, HttpStatus } from '@nestjs/common';
import { GeolocationService } from '../../src/geolocation/geolocation.service';
import { GeolocationResponseDto } from '../../src/geolocation/dto/geolocationResponse.dto';
import { IP } from './enums/ip.enums';
import { AxiosResponse } from 'axios';

describe('GeolocationService', () => {
  let service: GeolocationService;
  let cacheManager: Cache;
  let httpService: HttpService;

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
  };
  const mockHttpService = {
    get: jest.fn(),
  };
  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeolocationService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<GeolocationService>(GeolocationService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('[getCountryCodeByIp]', () => {
    describe('when ip address is in cache', () => {
      it('should return value from cache', async () => {
        const COUNTRY_IP = IP.VALID;
        const EXPECTED_COUNTRY_CODE = 'ES';
        const EXPECTED_RESULT = new GeolocationResponseDto({
          countryCode: EXPECTED_COUNTRY_CODE,
        });

        jest
          .spyOn(cacheManager, 'get')
          .mockReturnValueOnce(new Promise((res) => res(EXPECTED_RESULT)));

        const result = await service.getCountryCodeByIp(COUNTRY_IP);

        expect(cacheManager.get).toBeCalled();
        expect(httpService.get).not.toBeCalled();
        expect(result.countryCode).toBe(EXPECTED_RESULT.countryCode);
      });
    });
    describe('when ip address is NOT in cache', () => {
      it('should get response from api call', async () => {
        const COUNTRY_IP = IP.VALID;
        const EXPECTED_COUNTRY_CODE = 'ES';

        jest.spyOn(httpService, 'get').mockImplementationOnce(() =>
          of({
            status: HttpStatus.OK,
            data: { countryCode: EXPECTED_COUNTRY_CODE },
          } as AxiosResponse<GeolocationResponseDto>),
        );

        jest.spyOn(cacheManager, 'get').mockReturnValueOnce(null);

        const result = await service.getCountryCodeByIp(COUNTRY_IP);
        expect(cacheManager.get).toBeCalled();
        expect(cacheManager.get).toReturnWith(null);
        expect(httpService.get).toBeCalled();
        expect(result.countryCode).toBe(EXPECTED_COUNTRY_CODE);
      });

      it('should cache response on api success', async () => {
        const COUNTRY_IP = IP.VALID;
        const EXPECTED_COUNTRY_CODE = 'ES';
        const EXPECTED_RESULT = {
          [COUNTRY_IP]: {
            countryCode: EXPECTED_COUNTRY_CODE,
          } as GeolocationResponseDto,
        };
        let EXPECTED_CACHED_RESULT: Record<string, GeolocationResponseDto> = {};

        jest.spyOn(cacheManager, 'get').mockReturnValueOnce(null);
        jest.spyOn(httpService, 'get').mockImplementationOnce(() =>
          of({
            status: HttpStatus.OK,
            data: { countryCode: EXPECTED_COUNTRY_CODE },
          } as AxiosResponse<GeolocationResponseDto>),
        );
        jest
          .spyOn(cacheManager, 'set')
          .mockImplementationOnce(
            (ip: string, value: GeolocationResponseDto) => {
              EXPECTED_CACHED_RESULT[ip] = value;
            },
          );

        await service.getCountryCodeByIp(COUNTRY_IP);
        expect(cacheManager.set).toBeCalled();
        expect(EXPECTED_CACHED_RESULT).toMatchObject(EXPECTED_RESULT);
      });
    });

    it('should return null on error', async () => {
      const COUNTRY_IP = IP.VALID;
      const EXPECTED_VALUE = null;

      jest
        .spyOn(cacheManager, 'get')
        .mockImplementationOnce((_: string) => null);
      jest
        .spyOn(httpService, 'get')
        .mockImplementationOnce((_: string): any => {
          throw new Error('RUNTIME_EXCEPTION');
        });

      const result = await service.getCountryCodeByIp(COUNTRY_IP);
      expect(result).toBe(EXPECTED_VALUE);
    });
  });
});
