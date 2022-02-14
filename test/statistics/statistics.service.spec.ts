import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { Events } from '../../src/statistics/enums/events';
import { ClientResponseDto } from '../../src/common/dto/clientResponse.dto';
import { StatisticsService } from '../../src/statistics/statistics.service';
import { DiscoveryModule, DiscoveryService } from '@nestjs/core';
import { StatisticsModule } from '../../src/statistics/statistics.module';
import { ICountryStatistics } from '../../src/statistics/interfaces';

describe('StatisticsService', () => {
  let service: StatisticsService;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot()],
      providers: [StatisticsService],
    }).compile();

    service = module.get<StatisticsService>(StatisticsService);
    eventEmitter = module.get(EventEmitter2);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('[updateMaxDistance]', () => {
    it('should update max distance if new distance is greater', () => {
      const NEW_DISTANCE = 1000;
      const DISTANCE_IN_CLASS = 50;
      service.maxDistance = DISTANCE_IN_CLASS;
      service.updateMaxDistance(NEW_DISTANCE);
      const maxDistance = service.maxDistance;
      expect(maxDistance).toBe(NEW_DISTANCE);
    });
    it('should NOT update max distance if new distance is lesser', () => {
      const NEW_DISTANCE = 50;
      const DISTANCE_IN_CLASS = 1000;
      service.maxDistance = DISTANCE_IN_CLASS;
      service.updateMaxDistance(NEW_DISTANCE);
      const maxDistance = service.maxDistance;
      expect(maxDistance).toBe(DISTANCE_IN_CLASS);
    });
  });

  describe('[updateMinDistance]', () => {
    it('should update min distance if new distance is lesser', () => {
      const NEW_DISTANCE = 50;
      const DISTANCE_IN_CLASS = 1000;
      service.minDistance = DISTANCE_IN_CLASS;
      service.updateMinDistance(NEW_DISTANCE);
      const minDistance = service.minDistance;
      expect(minDistance).toBe(NEW_DISTANCE);
    });
    it('should NOT update min distance if new distance is greater', () => {
      const NEW_DISTANCE = 1000;
      const DISTANCE_IN_CLASS = 50;
      service.minDistance = DISTANCE_IN_CLASS;
      service.updateMinDistance(NEW_DISTANCE);
      const minDistance = service.minDistance;
      expect(minDistance).toBe(DISTANCE_IN_CLASS);
    });
  });

  describe('[updateAverageDistance]', () => {
    it('should make the right calculations', () => {
      const DISTANCES: Record<string, ICountryStatistics> = {
        '1000': {
          name: 'usa',
          distanceInKm: 1000,
          requests: 2,
        },
        '2000': {
          name: 'spain',
          distanceInKm: 2000,
          requests: 2,
        },
      };
      const EXPECTED_AVERAGE = (1000 * 2 + 2000 * 2) / 4;
      service.countriesStatistics = DISTANCES;
      service.updateAverageDistance();
      const result = service.averageDistanceInKm;
      expect(result).toBe(EXPECTED_AVERAGE);
    });
    it('should update average distances if there are more than 2 values', () => {
      const DISTANCES: Record<string, ICountryStatistics> = {
        '1000': {
          name: 'usa',
          distanceInKm: 1000,
          requests: 2,
        },
      };
      const EXPECTED_AVERAGE = 0;
      service.countriesStatistics = DISTANCES;
      service.updateAverageDistance();
      const result = service.averageDistanceInKm;
      expect(result).toBe(EXPECTED_AVERAGE);
    });
  });

  describe('[updateRequests]', () => {
    describe('when country is argentina', () => {
      it('should not update statistics and just return', () => {
        const CLIENT_RESPONSE_DTO = {
          country: { commonName: 'Argentina' },
        } as ClientResponseDto;
        eventEmitter.emit(Events.NEW_COUNTRY_REQUEST, CLIENT_RESPONSE_DTO);
        const maxFuntion = jest.spyOn(service, 'updateMaxDistance');
        const minFuntion = jest.spyOn(service, 'updateMinDistance');
        const averageFuntion = jest.spyOn(service, 'updateAverageDistance');
        expect(maxFuntion).not.toBeCalled();
        expect(minFuntion).not.toBeCalled();
        expect(averageFuntion).not.toBeCalled();
      });
    });
  });
});
