import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test } from '@nestjs/testing';
import { CountriesService } from '../src/countries/countries.service';
import { CurrenciesService } from '../src/currencies/currencies.service';
import { GeolocationService } from '../src/geolocation/geolocation.service';
import { StatisticsService } from '../src/statistics/statistics.service';
import { AppController } from '../src/app.controller';
import { IP } from './geolocation/enums/ip.enums';
import { ICountry } from '../src/countries/interfaces';
import { Country } from '../src/countries/country.class';
import { ClientResponseDto } from '../src/common/dto/clientResponse.dto';
import { GeolocationResponseDto } from '../src/geolocation/dto/geolocationResponse.dto';

describe('AppController', () => {
  let appController: AppController;
  let geolocationService: GeolocationService;
  let countriesService: CountriesService;
  let currenciesService: CurrenciesService;
  let statisticsService: StatisticsService;
  let eventEmitter: EventEmitter2;

  const mockGeolocationService = {
    getCountryCodeByIp: jest.fn(),
  };
  const mockCountriesService = {
    getCountryInformation: jest.fn(),
  };
  const mockCurrenciesService = {
    getExchangeRates: jest.fn(),
  };
  const mockStatisticsService = {
    getStatistics: jest.fn(),
    getAllRequestDistances: jest.fn(),
  };
  const mockEventEmitter2 = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: GeolocationService,
          useValue: mockGeolocationService,
        },
        {
          provide: CountriesService,
          useValue: mockCountriesService,
        },
        {
          provide: CurrenciesService,
          useValue: mockCurrenciesService,
        },
        {
          provide: StatisticsService,
          useValue: mockStatisticsService,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter2,
        },
      ],
    }).compile();

    appController = moduleRef.get<AppController>(AppController);
    geolocationService = moduleRef.get<GeolocationService>(GeolocationService);
    countriesService = moduleRef.get<CountriesService>(CountriesService);
    currenciesService = moduleRef.get<CurrenciesService>(CurrenciesService);
    statisticsService = moduleRef.get<StatisticsService>(StatisticsService);
    eventEmitter = moduleRef.get<EventEmitter2>(EventEmitter2);
  });

  describe('Controller status', () => {
    it('Should be defined', () => {
      expect(appController).toBeDefined();
    });
  });

  describe('[getCountryInformation]', () => {
    describe('when ip address is valid', () => {
      it('should return a valid response dto', async () => {
        const IP_ADDRESS = IP.VALID;
        const COUNTRY_CODE = 'ES';
        const COUNTRY_INFO = new Country({
          name: { common: 'Spain' },
          cca2: COUNTRY_CODE,
          currencies: { EUR: { name: 'Euro', symbol: '' } },
          languages: { spa: 'Spanish' },
          latlng: [40, -4],
          timezones: ['UTC'],
          translations: { spa: { common: 'España' } },
        });
        const RATES = { USD: 1.13 };
        const EXPECTED_RESULT: ClientResponseDto = {
          ip: IP_ADDRESS,
          date: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
          country: COUNTRY_INFO as ICountry,
          distance: {
            distanceInKm: 10275,
            from: [-34, -64],
            to: [40, -4],
          },
        };

        jest
          .spyOn(geolocationService, 'getCountryCodeByIp')
          .mockResolvedValueOnce({
            countryCode: COUNTRY_CODE,
          } as GeolocationResponseDto);
        jest
          .spyOn(countriesService, 'getCountryInformation')
          .mockResolvedValueOnce(COUNTRY_INFO);
        jest
          .spyOn(currenciesService, 'getExchangeRates')
          .mockResolvedValueOnce(RATES);

        const result = await appController.getCountryInformation(IP_ADDRESS);
        expect(result).toMatchObject(EXPECTED_RESULT);
        expect(result).toBeInstanceOf(ClientResponseDto);
        expect(eventEmitter.emit).toBeCalled();
      });
      describe('when errors ocurr inside a service', () => {
        it('should return error object with status 404', async () => {
          const IP_ADDRESS = IP.INVALID;
          const EXPECTED_RESULT = 404;
          jest
            .spyOn(geolocationService, 'getCountryCodeByIp')
            .mockResolvedValueOnce(null);

          try {
            const result = await appController.getCountryInformation(
              IP_ADDRESS,
            );
          } catch (err) {
            expect(err.response.statusCode).toBe(EXPECTED_RESULT);
          }
        });
      });
    });
  });
  describe('[getStatistics]', () => {
      it('should return a valid statistics dto',() => {});
  });
  describe('[getAllStatistics]', () => {
      it('should return a valid all statistics dto',() => {});
  });
});
