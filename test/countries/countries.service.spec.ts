import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AxiosResponse } from 'axios';
import { Cache } from 'cache-manager';
import { of } from 'rxjs';
import { apiResponse } from '../../src/countries/dto/apiResponse.dto';
import { getUTCtime } from '../../src/countries/helpers';
import { ICountry } from '../../src/countries/interfaces';
import { CountriesService } from '../../src/countries/countries.service';
import { Country } from '../../src/countries/country.class';

describe('CountriesService', () => {
  let service: CountriesService;
  let httpService: HttpService;
  let cacheManager: Cache;

  const mockConfigService = {
    get: jest.fn(),
  };
  const mockHttpService = {
    get: jest.fn(),
  };
  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountriesService,
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

    service = module.get<CountriesService>(CountriesService);
    httpService = module.get<HttpService>(HttpService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('[getCountryInformation]', () => {
    describe('when country code is in cache', () => {
      it('should return value from cache', async () => {
        const COUNTRY_CODE = 'ES';

        const EXPECTED_RESULT = new Country({
          cca2: COUNTRY_CODE,
          currencies: { EUR: { name: 'Euro', symbol: '' } },
          languages: { spa: 'Spanish' },
          latlng: [0, 0],
          name: { common: 'Spain' },
          timezones: ['UTC'],
          translations: { spa: { common: 'España' } },
        });

        const CACHE = {
          [COUNTRY_CODE]: EXPECTED_RESULT,
        };

        jest
          .spyOn(cacheManager, 'get')
          .mockImplementationOnce(
            async (key) => new Promise((res) => res(CACHE[key])),
          );
        const result = await service.getCountryInformation(COUNTRY_CODE);
        expect(cacheManager.get).toBeCalled();
        expect(result).toEqual(EXPECTED_RESULT);
        expect(httpService.get).not.toBeCalled();
      });
    });

    describe('when country code is NOT in cache', () => {
      it('should return value from api', async () => {
        const COUNTRY_CODE = 'ES';
        const CACHE = {};
        const API_RESPONSE: apiResponse[] = [
          {
            cca2: COUNTRY_CODE,
            currencies: { EUR: { name: 'Euro', symbol: '' } },
            languages: { spa: 'Spanish' },
            latlng: [0, 0],
            name: { common: 'Spain' },
            timezones: ['UTC'],
            translations: { spa: { common: 'España' } },
          },
        ];
        const TIMEZONE = [getUTCtime('UTC')];
        const EXPECTED_RESULT: ICountry = {
          commonName: 'Spain',
          spanishName: 'España',
          ISOcode: COUNTRY_CODE,
          coordinates: [0, 0],
          currencies: [{ code: 'EUR', name: 'Euro', symbol: '', usdRate: 0 }],
          languages: { spa: 'Spanish' },
          timezones: TIMEZONE,
        };
        jest
          .spyOn(cacheManager, 'get')
          .mockImplementationOnce((key) => CACHE[key]);
        jest.spyOn(httpService, 'get').mockImplementationOnce(() => {
          return of({
            status: HttpStatus.OK,
            data: API_RESPONSE,
          } as AxiosResponse<apiResponse[]>);
        });
        const result = await service.getCountryInformation(COUNTRY_CODE);
        expect(httpService.get).toBeCalled();
        expect(result).toEqual(EXPECTED_RESULT);
      });
      it('should cache response on api success', async () => {
        const COUNTRY_CODE = 'ES';
        const API_RESPONSE: apiResponse[] = [
          {
            cca2: COUNTRY_CODE,
            currencies: { EUR: { name: 'Euro', symbol: '' } },
            languages: { spa: 'Spanish' },
            latlng: [0, 0],
            name: { common: 'Spain' },
            timezones: ['UTC'],
            translations: { spa: { common: 'España' } },
          },
        ];
        const EXPECTED_CACHE = {
          [COUNTRY_CODE]: new Country(API_RESPONSE[0]),
        };
        let CACHE = {};
        jest.spyOn(cacheManager, 'get').mockResolvedValueOnce(null);
        jest.spyOn(httpService, 'get').mockImplementationOnce(() => {
          return of({
            status: HttpStatus.OK,
            data: API_RESPONSE,
          } as AxiosResponse<apiResponse[]>);
        });
        jest.spyOn(cacheManager, 'set').mockImplementationOnce((key, value) => {
          CACHE[key] = value;
        });
        await service.getCountryInformation(COUNTRY_CODE);
        expect(httpService.get).toBeCalled();
        expect(cacheManager.set).toBeCalled();
        expect(CACHE).toEqual(EXPECTED_CACHE);
      });
    });
  });

  it('should return null on error', async () => {
    const COUNTRY_CODE = 'ES';
    jest.spyOn(cacheManager, 'get').mockResolvedValueOnce(null);
    jest.spyOn(httpService, 'get').mockImplementationOnce(() => {
      throw new Error('RUNTIME_ERROR');
    });
    const result = await service.getCountryInformation(COUNTRY_CODE);
    expect(result).toBeNull();
  });
});
