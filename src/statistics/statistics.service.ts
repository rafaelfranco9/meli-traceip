import { Injectable, NotFoundException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ClientResponseDto } from 'src/common/dto/clientResponse.dto';
import { IStatisticsDto } from './dto/statistics.dto';
import { Events } from './enums/events';
import { ICountryStatistics } from './interfaces';

@Injectable()
export class StatisticsService {
  countriesStatistics: Record<string, ICountryStatistics> = {};
  maxDistance: number = 0;
  minDistance: number = 0;
  averageDistanceInKm: number = 0;

  @OnEvent(Events.NEW_COUNTRY_REQUEST)
  updateRequests(msg: ClientResponseDto) {
    if (
      msg.country.commonName.toLowerCase() === 'argentina' ||
      msg.distance.distanceInKm == 0
    )
      return;

    if (!!this.countriesStatistics[msg.distance.distanceInKm]) {
      this.countriesStatistics[msg.distance.distanceInKm].requests += 1;
    } else {
      this.countriesStatistics[msg.distance.distanceInKm] = {
        name: msg.country.commonName,
        requests: 1,
        distanceInKm: msg.distance.distanceInKm,
      };
    }
    this.updateMaxDistance(msg.distance.distanceInKm);
    this.updateMinDistance(msg.distance.distanceInKm);
    this.updateAverageDistance();
  }

  getStatistics(): IStatisticsDto | null {
    if (Object.keys(this.countriesStatistics).length > 1) {
      return {
        maxDistance: this.countriesStatistics[this.maxDistance],
        minDistance: this.countriesStatistics[this.minDistance],
        averageDistanceInKm: this.averageDistanceInKm,
      };
    } else {
      throw new NotFoundException(
        'No statistics yet, the service needs at least 2 different IP address to compare',
      );
    }
  }

  getAllRequestDistances() {
    return this.countriesStatistics;
  }

  updateMaxDistance(newDistance: number) {
    if (
      newDistance > this.maxDistance ||
      Object.keys(this.countriesStatistics).length == 1
    ) {
      this.maxDistance = newDistance;
    }
  }

  updateMinDistance(newDistance: number) {
    if (
      newDistance < this.minDistance ||
      Object.keys(this.countriesStatistics).length == 1
    ) {
      this.minDistance = newDistance;
    }
  }

  updateAverageDistance() {
    if (Object.keys(this.countriesStatistics).length > 1) {
      const gmAndRequestSum = Object.entries(this.countriesStatistics).reduce(
        (acc, [km, data]) => {
          const gigameter = +km / 1000000;
          acc[0] += gigameter * data.requests;
          acc[1] += data.requests;
          return acc;
        },
        [0, 0] as [number, number],
      );

      const averageInGigameters = gmAndRequestSum[0] / gmAndRequestSum[1];
      this.averageDistanceInKm = +(averageInGigameters * 1000000).toFixed(0);
    }
  }
}
