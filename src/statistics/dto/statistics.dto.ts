import { ICountryStatistics } from '../interfaces';

export interface IStatisticsDto {
  maxDistance: ICountryStatistics;
  minDistance: ICountryStatistics;
  averageDistanceInKm: number;
}
