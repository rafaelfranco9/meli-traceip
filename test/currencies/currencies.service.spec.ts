import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AxiosResponse } from 'axios';
import { Cache } from 'cache-manager';
import { of } from 'rxjs';
import { ICurrencies } from 'src/currencies/interfaces';
import { CurrenciesService } from '../../src/currencies/currencies.service';

describe('CurrenciesService', () => {
  let service: CurrenciesService;
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
        CurrenciesService,
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

    service = module.get<CurrenciesService>(CurrenciesService);
    httpService = module.get<HttpService>(HttpService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('[getCurrenciesWithUsdRate]', () => {
    describe('when rates is null', () => {
      it('should return same object', async () => {
        const FAKE_CURRENCIES: ICurrencies[] = [
          {
            code: 'JPY',
            name: 'Japanese yen',
            symbol: '¥',
            usdRate: 0,
          },
        ];
        const EXPECTED_RESULT: ICurrencies[] = [
          {
            code: 'JPY',
            name: 'Japanese yen',
            symbol: '¥',
            usdRate: 0,
          },
        ];
        jest.spyOn(service, 'getExchangeRates').mockResolvedValueOnce(null);
        const result = await service.getCurrenciesWithUsdRate(FAKE_CURRENCIES);
        expect(result).toEqual(EXPECTED_RESULT);
      });
    });
    describe('when rates is defined', () => {
      describe('when the currency code does NOT exist in rates', () => {
        it('should return the same object', async () => {
          const FAKE_CURRENCIES: ICurrencies[] = [
            {
              code: 'JPY',
              name: 'Japanese yen',
              symbol: '¥',
              usdRate: 0,
            },
          ];
          const EXPECTED_RESULT: ICurrencies[] = [
            {
              code: 'JPY',
              name: 'Japanese yen',
              symbol: '¥',
              usdRate: 0,
            },
          ];
          const FAKE_RATES = { USD: 1.23, CAD: 0.9 };

          jest
            .spyOn(service, 'getExchangeRates')
            .mockResolvedValueOnce(FAKE_RATES);
          const result = await service.getCurrenciesWithUsdRate(
            FAKE_CURRENCIES,
          );
          expect(result).toEqual(EXPECTED_RESULT);
        });
      });
      describe('when the currency code does exist in rates', () => {
        it('should return the object with usd rate different from zero', async () => {
          const FAKE_CURRENCIES: ICurrencies[] = [
            {
              code: 'JPY',
              name: 'Japanese yen',
              symbol: '¥',
              usdRate: 0,
            },
          ];
          const FAKE_RATES = { USD: 1.23, JPY: 0.00863 };
          jest
            .spyOn(service, 'getExchangeRates')
            .mockResolvedValueOnce(FAKE_RATES);
          const result = await service.getCurrenciesWithUsdRate(
            FAKE_CURRENCIES,
          );
          expect(result[0].usdRate).not.toBe(0);
        });
      });
    });
  });

  describe('[getExchangeRates]', () => {
    const CACHE_RATES_KEY = 'RATES';

    describe('when rates are in cache', () => {
      it('should return rates from cache', async () => {
        const EXPECTED_RATES = { USD: 1.2, ARS: 0.009 };
        const CACHE = {
          [CACHE_RATES_KEY]: EXPECTED_RATES,
        };
        jest
          .spyOn(cacheManager, 'get')
          .mockResolvedValueOnce(CACHE[CACHE_RATES_KEY]);
        const result = await service.getExchangeRates();
        expect(result).toEqual(EXPECTED_RATES);
        expect(httpService.get).not.toBeCalled();
      });
    });
    describe('when rates are NOT in cache', () => {
      it('should get rates from api', async () => {
        const EXPECTED_RATES = { USD: 1.2, ARS: 0.009 };
        const CACHE = {};
        jest
          .spyOn(cacheManager, 'get')
          .mockResolvedValueOnce(CACHE[CACHE_RATES_KEY]);
        jest.spyOn(httpService, 'get').mockImplementationOnce(() => {
          return of({
            status: HttpStatus.OK,
            data: { rates: EXPECTED_RATES },
          } as AxiosResponse);
        });
        const result = await service.getExchangeRates();
        expect(httpService.get).toBeCalled();
        expect(result).toEqual(EXPECTED_RATES);
      });
      it('should cache api response', async () => {
        const EXPECTED_RATES = { USD: 1.2, ARS: 0.009 };
        const EXPECTED_CACHE = {
          [CACHE_RATES_KEY]: EXPECTED_RATES,
        };
        let CACHE = {};
        jest
          .spyOn(cacheManager, 'get')
          .mockResolvedValueOnce(CACHE[CACHE_RATES_KEY]);
        jest.spyOn(httpService, 'get').mockImplementationOnce(() => {
          return of({
            status: HttpStatus.OK,
            data: { rates: EXPECTED_RATES },
          } as AxiosResponse);
        });
        jest.spyOn(cacheManager, 'set').mockImplementationOnce((key, rates) => {
          CACHE[key] = rates;
        });
        const result = await service.getExchangeRates();
        expect(httpService.get).toBeCalled();
        expect(cacheManager.set).toBeCalled();
        expect(CACHE).toMatchObject(EXPECTED_CACHE);
      });
    });
    it('should return null on error', async () => {
      const CACHE = {};
      jest
        .spyOn(cacheManager, 'get')
        .mockResolvedValueOnce(CACHE[CACHE_RATES_KEY]);
      jest.spyOn(httpService, 'get').mockImplementationOnce(() => {
        throw new Error('RUNTIME_ERROR');
      });
      const result = await service.getExchangeRates();
      expect(result).toBeNull();
    });
  });
});
